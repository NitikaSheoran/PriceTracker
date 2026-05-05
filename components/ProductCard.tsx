import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import {Product} from '@/types';
interface Props{
    product: Product;
}
function ProductCard({product}:Props) {
  return (
    <Link href={`/products/${product._id}`} className='group'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition w-[220px]'>
            <div className='flex items-center justify-center bg-gray-50 h-[200px] p-4'>
                <Image src={product.image} alt={product.title} width={200} height={200} className='object-contain group-hover:scale-105 transition duration-300'
            />
            </div>
        </div>
        <div className='p-4 flex flex-col gap-2'>
            <h3 className='text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-black transition'>
                {product.title}
            </h3>
            <div className='flex justify-between items-center mt-1'>
                <p className='text-xs text-gray-500 capitalize'> 
                    {product.category}
                </p>
                <p className='text-base font-bold text-green-600'>
                    <span>{product?.currency}</span>
                    <span>{product?.currentPrice}</span>
                </p>
            </div>
        </div>
    </Link>
  )
}

export default ProductCard