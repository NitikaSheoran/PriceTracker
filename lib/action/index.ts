"use server";

import { revalidatePath } from "next/cache";

import { scrapeAmazonProduct } from "../scraper";
import { connectToDB } from "../mongoose";

import Product from "../Models/product.model";

import {
  getAveragePrice,
  getHighestPrice,
  getLowestPrice,
} from "../utils";

import {
  generateEmailBody,
  sendEmail,
} from "../nodemailer";

import type { User } from "@/types";

/**
 * Convert Mongoose product to frontend-safe object.
 */
function serializeProduct(product: any) {
  if (!product) return null;

  return {
    ...product,
    _id: product._id?.toString(),

    priceHistory:
      product.priceHistory?.map(
        (item: any) => ({
          price: item.price,
          date: item.date
            ? item.date.toISOString()
            : undefined,
        })
      ) || [],

    users:
      product.users?.map(
        (user: any) => ({
          email: user.email,
        })
      ) || [],
  };
}

/**
 * Validate Amazon URL.
 */
function isValidAmazonUrl(
  productUrl: string
) {
  try {
    const parsedUrl =
      new URL(productUrl);

    const hostname =
      parsedUrl.hostname.toLowerCase();

    return (
      hostname === "amazon.com" ||
      hostname.endsWith(".amazon.com") ||
      hostname === "amazon.in" ||
      hostname.endsWith(".amazon.in")
    );
  } catch {
    return false;
  }
}

/**
 * Scrape and store product.
 */
export async function scrapeAndStoreProduct(
  productUrl: string
) {
  console.log(
    "Scrape and store:",
    productUrl
  );

  if (!productUrl) {
    throw new Error(
      "Product URL is required"
    );
  }

  if (!isValidAmazonUrl(productUrl)) {
    throw new Error(
      "Please provide a valid Amazon product URL"
    );
  }

  try {
    await connectToDB();

    const scrapedProduct =
      await scrapeAmazonProduct(
        productUrl
      );

    if (!scrapedProduct) {
      throw new Error(
        "Unable to scrape product"
      );
    }

    console.log(
      "Scraped product:",
      scrapedProduct
    );

    /**
     * Check existing product.
     */
    const existingProduct =
      await Product.findOne({
        url: scrapedProduct.url,
      });

    let updatedPriceHistory: any[] =
      [];

    /**
     * Existing product.
     */
    if (
      existingProduct &&
      existingProduct.priceHistory
        ?.length
    ) {
      updatedPriceHistory = [
        ...existingProduct.priceHistory.map(
          (item: any) => ({
            price: item.price,
            date: item.date,
          })
        ),
      ];

      const lastPrice =
        updatedPriceHistory.at(-1)?.price;

      /**
       * Only add price if it changed.
       */
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
    } else {
      /**
       * First time tracking.
       */
      updatedPriceHistory = [
        {
          price:
            scrapedProduct.currentPrice,
          date: new Date(),
        },
      ];
    }

    /**
     * Keep last 50 price records.
     */
    updatedPriceHistory =
      updatedPriceHistory.slice(-50);

    const productData = {
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

    const savedProduct =
      await Product.findOneAndUpdate(
        {
          url: scrapedProduct.url,
        },
        productData,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      ).lean();

    if (!savedProduct) {
      throw new Error(
        "Failed to save product"
      );
    }

    console.log(
      "Saved product:",
      savedProduct
    );

    revalidatePath("/");
    revalidatePath(
      `/products/${savedProduct._id}`
    );

    return serializeProduct(
      savedProduct
    );
  } catch (error: any) {
    console.error(
      "scrapeAndStoreProduct error:",
      error
    );

    throw new Error(
      error?.message ||
        "Failed to create/update product"
    );
  }
}

/**
 * Get product by ID.
 */
export async function getProductById(
  productId: string
) {
  try {
    await connectToDB();

    const product =
      await Product.findById(
        productId
      ).lean();

    if (!product) {
      return null;
    }

    return serializeProduct(product);
  } catch (error: any) {
    console.error(
      "getProductById error:",
      error
    );

    return null;
  }
}

/**
 * Get all products.
 */
export async function getAllProducts() {
  try {
    await connectToDB();

    const products =
      await Product.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return products.map(
      serializeProduct
    );
  } catch (error: any) {
    console.error(
      "getAllProducts error:",
      error
    );

    return [];
  }
}

/**
 * Get similar products.
 */
export async function getSimilarProducts(
  productId: string
) {
  try {
    await connectToDB();

    const currentProduct =
      await Product.findById(
        productId
      ).lean();

    if (!currentProduct) {
      return [];
    }

    const similarProducts =
      await Product.find({
        _id: {
          $ne: productId,
        },

        category:
          currentProduct.category,
      })
        .limit(3)
        .lean();

    return similarProducts.map(
      serializeProduct
    );
  } catch (error: any) {
    console.error(
      "getSimilarProducts error:",
      error
    );

    return [];
  }
}

/**
 * Add user email to tracked product.
 */
export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    await connectToDB();

    if (!userEmail) {
      throw new Error(
        "Email is required"
      );
    }

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    const userExists =
      product.users.some(
        (user: User) =>
          user.email === userEmail
      );

    if (userExists) {
      console.log("email exists");
      return {
        success: true,
        message: "Email already tracking this product",
      };
    }

    product.users.push({
      email: userEmail,
    });

    await product.save();

    const productInfo = {
      title: product.title,
      url: product.url,
    };

    const emailContent =
      await generateEmailBody(
        productInfo,
        "WELCOME"
      );

    await sendEmail(
      emailContent,
      [userEmail]
    );

    console.log(
      "User added and welcome email sent:",
      userEmail
    );
  } catch (error: any) {
    console.error(
      "addUserEmailToProduct error:",
      error
    );

    throw new Error(
      error?.message ||
        "Failed to track product"
    );
  }
}