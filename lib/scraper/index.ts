"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
  console.log("url(/scraper/index.ts/scrapeAmazonProduct): ", url)
  
  if(!url) {
    throw new Error("Product url is required");
  }


  try {
    const apiKey = process.env.SCRAPER_API_KEY;
    const response = await axios.get(
    `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`
    );
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Extract the product title
    const title = $('#productTitle').text().trim();
    if (!title) {
      throw new Error(
        "Could not extract product title. Amazon page structure may have changed."
      );
    }
    
    const currentPriceText =
      extractPrice(
        $(".priceToPay span.a-price-whole"),
        $(".priceToPay span.a-offscreen"),
        $(".a-price.aok-align-center span.a-offscreen"),
        $("#corePriceDisplay_desktop_feature_div span.a-offscreen"),
        $(".a-price span.a-offscreen")
      );

    const originalPriceText =
      extractPrice(
        $("#priceblock_ourprice"),
        $(".a-price.a-text-price span.a-offscreen"),
        $("#listPrice"),
        $("#priceblock_dealprice"),
        $(".basisPrice .a-offscreen"),
        $(".a-text-price .a-offscreen")
      );
    const currentPrice = Number(currentPriceText);
    const originalPrice = Number(originalPriceText);
    
    if (!currentPrice && !originalPrice) {
      throw new Error("Could not extract product price from Amazon.");
    }
    const finalCurrentPrice = currentPrice || originalPrice;
    const finalOriginalPrice = originalPrice || currentPrice;

    const text = $('#availability span').text().trim().toLowerCase();
    const outOfStock = text.includes("currently unavailable") || text.includes("out of stock");

    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}'

    let imageUrls : string[] = [];
    try {
      imageUrls = Object.keys(JSON.parse(images));
    } catch {
      console.log(
        "Could not parse Amazon image data"
      );
    }

    const currency = extractCurrency($('.a-price-symbol'))
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

    const description = extractDescription($)

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: finalCurrentPrice,
      originalPrice: finalOriginalPrice,
      discountRate: Number(discountRate),
      category: "Unknown",
      reviewsCount:0,
      stars: 0,
      isOutOfStock: outOfStock,
      description,
    }
    console.log(data)
    return data;
  } catch (error: any) {
    console.error(
      "Amazon scraping failed:",
      error?.response?.data ||
        error?.message ||
        error);
    throw new Error(
      error?.message ||
        "Failed to scrape Amazon product"
    );
  }
}