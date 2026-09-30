import Image from "next/image";

import Searchbar from "@/components/Searchbar";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";

import { getAllProducts } from "@/lib/action";

const Home = async () => {
  const allProducts =
    await getAllProducts();

  return (
    <>
      <section className="px-6 md:px-20 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex max-xl:flex-col items-center gap-16">
          <div className="flex flex-col justify-center max-w-xl">
            <p className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              Smart Shopping Starts Here:

              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-4">
              Unleash the Power of{" "}
              <span className="text-blue-600">
                PriceWise
              </span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg">
              Track product prices, monitor
              historical price changes and get
              notified when prices drop.
            </p>

            <Searchbar />
          </div>

          <HeroCarousel />
        </div>
      </section>

      <section className="px-6 md:px-20 py-16">
        <h2 className="text-2xl font-semibold mb-10">
          Trending
        </h2>

        {allProducts.length === 0 ? (
          <p className="text-gray-500">
            No products are being tracked yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {allProducts.map(
              (product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              )
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;