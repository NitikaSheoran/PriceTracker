import { NextResponse } from "next/server";

import {
  getLowestPrice,
  getHighestPrice,
  getAveragePrice,
  getEmailNotifType,
} from "@/lib/utils";

import { connectToDB } from "@/lib/mongoose";

import Product from "@/lib/Models/product.model";

import { scrapeAmazonProduct } from "@/lib/scraper";

import {
  generateEmailBody,
  sendEmail,
} from "@/lib/nodemailer";

export const maxDuration = 300;

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export async function GET(
  request: Request
) {
  try {
    await connectToDB();

    const products =
      await Product.find();

    if (!products.length) {
      return NextResponse.json({
        message:
          "No products to update",
        data: [],
      });
    }

    const updatedProducts =
      await Promise.all(
        products.map(
          async (currentProduct) => {
            try {
              console.log(
                "Checking:",
                currentProduct.url
              );

              /**
               * Scrape latest data.
               */
              const scrapedProduct =
                await scrapeAmazonProduct(
                  currentProduct.url
                );

              if (!scrapedProduct) {
                return null;
              }

              /**
               * Previous price.
               */
              const lastPrice =
                currentProduct.priceHistory.at(
                  -1
                )?.price;

              /**
               * Only add history entry
               * when price changed.
               */
              let updatedPriceHistory =
                currentProduct.priceHistory.map(
                  (item: any) => ({
                    price: item.price,
                    date: item.date,
                  })
                );

              if (
                lastPrice !==
                scrapedProduct.currentPrice
              ) {
                updatedPriceHistory.push({
                  price:
                    scrapedProduct.currentPrice,

                  date: new Date(),
                });
              }

              /**
               * Keep last 50 records.
               */
              updatedPriceHistory =
                updatedPriceHistory.slice(
                  -50
                );

              /**
               * Check notification BEFORE
               * updating currentProduct.
               *
               * This is important because we
               * need the old historical state.
               */
              const productForNotification =
                {
                  ...scrapedProduct,

                  _id:
                    currentProduct._id.toString(),

                  priceHistory:
                    currentProduct.priceHistory,

                  lowestPrice:
                    currentProduct.lowestPrice,

                  highestPrice:
                    currentProduct.highestPrice,

                  averagePrice:
                    currentProduct.averagePrice,

                  users:
                    currentProduct.users,
                };

              const emailNotifType =
                getEmailNotifType(
                  productForNotification as any,
                  currentProduct.toObject()
                );

              /**
               * Prepare updated product.
               */
              const updatedData = {
                ...scrapedProduct,

                priceHistory:
                  updatedPriceHistory,

                lowestPrice:
                  getLowestPrice(
                    updatedPriceHistory
                  ),

                highestPrice:
                  getHighestPrice(
                    updatedPriceHistory
                  ),

                averagePrice:
                  getAveragePrice(
                    updatedPriceHistory
                  ),
              };

              /**
               * Update DB.
               */
              const updatedProduct =
                await Product.findOneAndUpdate(
                  {
                    url: currentProduct.url,
                  },
                  updatedData,
                  {
                    new: true,
                  }
                );

              if (!updatedProduct) {
                return null;
              }

              console.log(
                "Updated product:",
                updatedProduct.title
              );

              /**
               * Send notification.
               */
              if (
                emailNotifType &&
                updatedProduct.users
                  ?.length
              ) {
                const productInfo = {
                  title:
                    updatedProduct.title,

                  url:
                    updatedProduct.url,
                };

                const emailContent =
                  await generateEmailBody(
                    productInfo,
                    emailNotifType
                  );

                const userEmails =
                  updatedProduct.users.map(
                    (user: any) =>
                      user.email
                  );

                await sendEmail(
                  emailContent,
                  userEmails
                );
              }

              return updatedProduct;
            } catch (error) {
              console.error(
                `Failed to update ${currentProduct.url}:`,
                error
              );

              return null;
            }
          }
        )
      );

    return NextResponse.json({
      message:
        "Products checked successfully",

      data: updatedProducts.filter(
        Boolean
      ),
    });
  } catch (error: any) {
    console.error(
      "Cron error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update products",

        error:
          error?.message ||
          "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}