import React from "react";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getProductById,
  getSimilarProducts,
} from "@/lib/action";

import type { Product } from "@/types";

import { formatNumber } from "@/lib/utils";

import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import Modal from "@/components/Modal";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const ProductDetails = async ({
  params,
}: Props) => {
  const { id } = await params;

  const product =
    (await getProductById(
      id
    )) as Product | null;

  if (!product) {
    redirect("/");
  }

  const similarProducts =
    await getSimilarProducts(id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex gap-16 xl:flex-row flex-col items-start">
        {/* Product Image */}
        <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md mx-auto">
          <Image
            src={product.image}
            height={580}
            width={400}
            alt={product.title}
            className="mx-auto object-contain"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col bg-white p-6 rounded-2xl shadow-md">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6 border-b">
            <div className="flex flex-col gap-3">
              <p className="text-2xl md:text-3xl font-semibold text-gray-800">
                {product.title}
              </p>

              <Link
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Visit Product
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Image
                  src="/assets/icons/red-heart.svg"
                  alt="reviews"
                  width={20}
                  height={20}
                />

                <p className="text-sm font-semibold text-[#D46F77]">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                <Image
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>

              <div className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                <Image
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold text-green-600">
                {product.currency}{" "}
                {formatNumber(
                  product.currentPrice
                )}
              </p>

              {product.originalPrice >
                product.currentPrice && (
                <p className="text-lg text-gray-400 line-through">
                  {product.currency}{" "}
                  {formatNumber(
                    product.originalPrice
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex gap-6">
                <div className="flex items-center gap-1">
                  <Image
                    src="/assets/icons/star.svg"
                    alt="rating"
                    width={16}
                    height={16}
                  />

                  <p className="text-sm font-semibold">
                    {product.stars || "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Image
                    src="/assets/icons/comment.svg"
                    alt="reviews"
                    width={16}
                    height={16}
                  />

                  <p className="text-sm font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>

              {product.discountRate > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  {product.discountRate}% OFF
                </p>
              )}

              {product.isOutOfStock && (
                <p className="text-sm text-red-500 font-semibold">
                  Currently out of stock
                </p>
              )}
            </div>
          </div>

          {/* Price statistics */}
          <div className="my-8 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PriceInfoCard
                title="Current Price"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${product.currency} ${formatNumber(
                  product.currentPrice
                )}`}
              />

              <PriceInfoCard
                title="Average Price"
                iconSrc="/assets/icons/chart.svg"
                value={`${product.currency} ${formatNumber(
                  product.averagePrice
                )}`}
              />

              <PriceInfoCard
                title="Highest Price"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(
                  product.highestPrice
                )}`}
              />

              <PriceInfoCard
                title="Lowest Price"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(
                  product.lowestPrice
                )}`}
              />
            </div>
          </div>

          <Modal productId={id} />
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 flex flex-col gap-10 bg-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-semibold text-gray-800">
            Product Description
          </h3>

          <div className="text-gray-600 leading-relaxed whitespace-pre-line">
            No description available.
          </div>
        </div>

        {/* Buy Now */}
        <Link
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit mx-auto flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          <Image
            src="/assets/icons/bag.svg"
            alt="buy"
            width={22}
            height={22}
          />

          <span className="font-medium">
            Buy Now
          </span>
        </Link>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="py-14 flex flex-col gap-4 w-full">
          <p className="text-xl font-semibold text-gray-800">
            Similar Products
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4">
            {similarProducts.map(
              (product) => (
                <ProductCard
                  key={product._id}
                  product={
                    product as Product
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;