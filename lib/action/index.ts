"use server"
import { revalidatePath } from "next/cache";
import { scrapeAmazonProduct } from "../scraper";
import { connectToDB } from "../mongoose";
import { User } from "@/types";
import Product from "../Models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string){
    console.log("Product(/action/index.ts/scrapedAnsStoreProduct):: ", productUrl);
    if(!productUrl) return;

    try{
        await connectToDB();
        const scrapedProduct = await scrapeAmazonProduct(productUrl);
        console.log("Scraped Product (/action/index.ts/scrapedAnsStoreProduct): ", scrapedProduct)
        if(!scrapedProduct) return;

        // store product in database
        let product = scrapedProduct;
        let updatedPriceHistory: { price: number }[] = [];
        const existingProduct = await Product.findOne({url: scrapedProduct.url})
        if (existingProduct &&  existingProduct.priceHistory?.length > 0) {
            updatedPriceHistory = [...existingProduct.priceHistory];

            const lastPrice =
                existingProduct.priceHistory[
                existingProduct.priceHistory.length - 1
                ]?.price;

            if (lastPrice !== scrapedProduct.currentPrice) {
                updatedPriceHistory.push({ price: scrapedProduct.currentPrice });
            }

            // product = {
            //     ...scrapedProduct,
            //     priceHistory: updatedPriceHistory,
            //     lowestPrice: getLowestPrice(updatedPriceHistory),
            //     highestPrice: getHighestPrice(updatedPriceHistory),
            //     averagePrice: getAveragePrice(updatedPriceHistory),
            // };

        } else {
            updatedPriceHistory = [
                { price: scrapedProduct.currentPrice }
            ];
            // product = {
            //     ...scrapedProduct,
            //     priceHistory: [{ price: scrapedProduct.currentPrice }],
            //     lowestPrice: scrapedProduct.currentPrice,
            //     highestPrice: scrapedProduct.currentPrice,
            //     averagePrice: scrapedProduct.currentPrice,
            // };
        }

        const productData = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const newProduct = await Product.findOneAndUpdate({url: scrapedProduct.url},
            productData,
            {upsert: true, new: true}
        );
        console.log("Updated Product(/action/index.ts/scrapeAndAtoreProduct):", newProduct);

        revalidatePath(`/products/${newProduct._id}`);

    }catch(error: any){
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}

export async function getProductById(productId: string){
    try{
        await connectToDB();
        const product = await Product.findOne({_id: productId});
        if(!product) return null;

        return product;
        
    }catch(error: any){
        console.log(error.message)
    }
}

export async function getAllProducts(){
    try{
        await connectToDB();
        const products = await Product.find();
        return products;
    }catch(error: any){
        console.log(error.message)
    }
}

export async function getSimilarProducts(productId: string){
    try{
        await connectToDB();
        const currentProduct = await Product.findById(productId);
        if(!currentProduct) return null;
        const similarProducts = await Product.find({
            _id: {$ne: productId},
        }).limit(3);

        return similarProducts;
    }catch(error: any){
        console.log(error.message)
    }
}

export async function addUserEmailToProduct(productId: string, userEmail: string){
    try{
        await connectToDB()
        const product = await Product.findById(productId)
        console.log("Product (/action/index.ts/addUserEmailToProduct): ", product)
        if(!product) return

        const userExists = product.users.some((user:User)=>user.email===userEmail);
        if(!userExists){
            product.users.push({email:userEmail})
            await product.save()
            const emailContent = await generateEmailBody(product, "WELCOME");
            console.log("userEmails: ", userEmail)
            await sendEmail(emailContent, [userEmail]);
        }
    }catch(error: any){
        console.log(error.message)
    }
}