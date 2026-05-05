"use client"

import React from 'react'
import Image from 'next/image';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

const heroImages = [
    { imgUrl: '/assets/images/hero-1.svg', alt: 'smartWatch'},
    { imgUrl: '/assets/images/hero-2.svg', alt: 'bag'},
    { imgUrl: '/assets/images/hero-3.svg', alt: 'lamp'},
    { imgUrl: '/assets/images/hero-4.svg', alt: 'air-fryer'},
    { imgUrl: '/assets/images/hero-5.svg', alt: 'chair'}
]

function HeroCarousel() {
  return (
    <div className='relative w-full max-w-xl mx-auto'>
        <Carousel 
          showThumbs={false} 
          autoPlay 
          infiniteLoop 
          interval={2000} 
          showArrows={false} 
          showStatus={false}
          className="rounded-2xl overflow-hidden shadow-lg bg-white"
        >
            {heroImages.map((image)=>(
                <div key={image.alt} className="flex justify-center items-center p-6">
                  <Image 
                    src={image.imgUrl}
                    alt={image.alt}
                    height={400}
                    width={400}
                    className='object-contain transition-transform duration-300 hover:scale-105'
                  />
                </div>
            ))}
        </Carousel>

        <Image 
          src="/assets/icons/hand-drawn-arrow.svg" 
          alt='arrow' 
          height={175} 
          width={175} 
          className='max-xl:hidden absolute -left-24 bottom-0 opacity-70'
        />
    </div>
  )
}

export default HeroCarousel