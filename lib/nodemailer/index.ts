"use server";

import dns from "node:dns";
import nodemailer from "nodemailer";

import type {
  EmailContent,
  EmailProductInfo,
  NotificationType,
} from "@/types";

dns.setDefaultResultOrder("ipv4first");

const Notification = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
} as const;

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
): Promise<EmailContent> {
  const THRESHOLD_PERCENTAGE = 40;

  const shortenedTitle =
    product.title.length > 50
      ? `${product.title.substring(0, 50)}...`
      : product.title;

  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `Welcome to PriceWise - ${shortenedTitle}`;
      body = `
        <div>
          <h2>Welcome to PriceWise 🚀</h2>
          <p>
            You are now tracking:
            <strong>${product.title}</strong>
          </p>
          <p>
            We will notify you when there is an important
            change in price, stock availability, or discount.
          </p>
          <p>
            <a href="${product.url}" target="_blank">
              View Product
            </a>
          </p>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} is back in stock!`;
      body = `
        <div>
          <h3>${product.title} is now back in stock!</h3>
          <p>The product is available again.</p>
          <p>
            <a href="${product.url}" target="_blank">
              View Product
            </a>
          </p>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Lowest Price Alert - ${shortenedTitle}`;
      body = `
        <div>
          <h3>
            ${product.title} has reached a new historical low price!
          </h3>
          <p>
            This is the lowest price recorded by PriceWise.
          </p>
          <p>
            <a href="${product.url}" target="_blank">
              View Product
            </a>
          </p>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Discount Alert - ${shortenedTitle}`;
      body = `
        <div>
          <h3>
            ${product.title} now has a discount of
            ${THRESHOLD_PERCENTAGE}% or more!
          </h3>
          <p>
            <a href="${product.url}" target="_blank">
              View Product
            </a>
          </p>
        </div>
      `;
      break;

    default:
      throw new Error("Invalid notification type");
  }

  return { subject, body };
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

export async function verifyEmailConnection() {
  try {
    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD
    ) {
      throw new Error(
        "GMAIL_USER or GMAIL_APP_PASSWORD is missing"
      );
    }

    await transporter.verify();

    console.log(
      "✅ Gmail SMTP connection successful"
    );

    return {
      success: true,
      message: "SMTP connection successful",
    };
  } catch (error: any) {
    console.error(
      "❌ Gmail SMTP connection failed:",
      error
    );

    return {
      success: false,
      message:
        error?.message ||
        "SMTP connection failed",
    };
  }
}

export async function sendEmail(
  emailContent: EmailContent,
  sendTo: string[]
) {
  try {
    const gmailUser =
      process.env.GMAIL_USER;

    const gmailPassword =
      process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      throw new Error(
        "Gmail credentials are not configured"
      );
    }

    const validEmails = sendTo
      .map((email) => email.trim())
      .filter((email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );

    if (!validEmails.length) {
      throw new Error(
        "No valid recipient email address"
      );
    }

    console.log(
      "📧 Sending email to:",
      validEmails
    );

    const info =
      await transporter.sendMail({
        from: `"PriceWise" <${gmailUser}>`,
        to: validEmails,
        subject: emailContent.subject,
        html: emailContent.body,
      });

    console.log(
      "✅ Email sent successfully"
    );

    console.log(
      "Message ID:",
      info.messageId
    );

    return {
      success: true,
      message:
        "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(
      "❌ Email sending failed:",
      error
    );

    return {
      success: false,
      message:
        error?.message ||
        "Failed to send email",
    };
  }
}