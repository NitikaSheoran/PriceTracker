import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const navIcons = [
    {src: '/assets/icons/search.svg', alt: 'search'},
    {src: '/assets/icons/black-heart.svg', alt: 'heart'},
    {src: '/assets/icons/user.svg', alt: 'user'}
]

const Navbar = () => {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="flex justify-between items-center px-6 md:px-20 py-4">
            
            {/* Logo */}
            <Link href="/" className='flex items-center gap-2'>
                <Image src="/assets/icons/logo.svg" width={30} height={30} alt='logo'/>
                <p className='text-lg font-semibold tracking-tight'>
                    Price<span className='text-blue-600'>Wise</span>
                </p>
            </Link>

            {/* Icons */}
            <div className='flex items-center gap-6'>
                {navIcons.map((icon)=>(
                    <Image 
                      key={icon.alt} 
                      src={icon.src} 
                      alt={icon.alt} 
                      width={24} 
                      height={24} 
                      className='cursor-pointer opacity-80 hover:opacity-100 transition duration-200 hover:scale-110'
                    /> 
                ))}
            </div>
        </nav>
    </header>
  )
}

export default Navbar