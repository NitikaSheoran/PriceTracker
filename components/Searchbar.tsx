"use client"
import { scrapeAndStoreProduct } from '@/lib/action';
import React, { useState, SyntheticEvent } from 'react'

const isValidAmazonProductUrl = (url: string) => {
    try{
        const parseUrl = new URL(url);
        const hostname = parseUrl.hostname;

        if(hostname.includes('amazon.com') || hostname.includes('amzon.') || hostname.includes('amazon')){
            return true;
        }
    }catch(error){
        return false;
    }
    return false;
}

const Searchbar = ()=> {

  const [searchPrompt, setSearchPromt] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) =>{
    event.preventDefault();

    const isValidLink = isValidAmazonProductUrl(searchPrompt);
    alert(isValidLink? 'Valid Link': 'Invalid Link')

    if(!isValidLink) return alert("Please provide a valid amazon link");
    try{
        setIsLoading(true)

        // scrape the product
        const product = await scrapeAndStoreProduct(searchPrompt);
    }catch(error){
        console.log(error)
    }finally{
        setIsLoading(false)
    }
  }

  return (
    <form 
      className='flex flex-col sm:flex-row items-center gap-4 mt-8 w-full max-w-xl'
      onSubmit={handleSubmit}
    >
        <input 
          type='text' 
          value={searchPrompt}
          onChange={(e)=>setSearchPromt(e.target.value)}
          placeholder='Paste Amazon product link...'
          className='flex-1 w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
        />

        <button 
          type='submit' 
          disabled={searchPrompt === ''}
          className='px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
            {isLoading? 'Searching...': 'Search'}
        </button>
    </form>
  )
}

export default Searchbar