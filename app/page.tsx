import Image from "next/image"
import Searchbar from "@/components/Searchbar"
import HeroCarousel from "@/components/HeroCarousel"
import { getAllProducts } from "@/lib/action"
import ProductCard from "@/components/ProductCard"
const Home = async ()=>{
  
  const allProducts = await getAllProducts()
  return (
    <>
      <section className="px-6 md:px-20 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex max-xl:flex-col items-center gap-16">
          
          {/* Left Content */}
          <div className="flex flex-col justify-center max-w-xl">
            
            <p className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              Smart Shopping Starts Here:
              <Image src="/assets/icons/arrow-right.svg" alt="arrow-right" width={16} height={16} />
            </p>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-4">
              Unleash the Power of <span className="text-blue-600">PriceWise</span> 
            </h1>

            <p className="mt-6 text-gray-600 text-lg">
              Powerful, self-serve product analytics to help you convert, engage and retain more.
            </p>

            <Searchbar />
          </div>
          
          {/* Right Carousel */}
          <HeroCarousel />
        </div>
      </section>

      {/* Trending Section */}
      <section className="px-6 md:px-20 py-16">
        <h2 className="text-2xl font-semibold mb-10">Trending</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {allProducts?.map((product)=>(
            <div 
              key={product}
              className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white"
            >
             <ProductCard key = {product._id} product = {product}/>
            </div>
          ))}
        </div>

      </section>
    </>
  )
}

export default Home