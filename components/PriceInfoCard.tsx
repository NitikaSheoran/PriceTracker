import React from 'react'
import Image from 'next/image'

interface Props{
    title: string,
    iconSrc: string,
    value:string
}
const PriceInfoCard = ({title, iconSrc, value}: Props) => {
  return (
    <div className='flex flex-col gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition'>
        <p className='text-sm text-gray-500 font-medium'>{title}</p>
        <div className='flex items-center gap-2'>
            <div className='p-2 bg-gray-100 rounded-lg'><Image src={iconSrc} alt={title} width={24} height={24} /> </div>
            <p className='text-xl md:text-2xl font-bold text-gray-800'>{value}</p>
        </div>
    </div>
  )
}

export default PriceInfoCard