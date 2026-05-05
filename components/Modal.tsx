"use client";

import React, { FormEvent, useState , SyntheticEvent, useEffect} from 'react'

import { Dialog } from '@headlessui/react'
import { Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { Fragment } from 'react'
import Image from 'next/image'
import { addUserEmailToProduct } from '@/lib/action';
import Product from '@/lib/Models/product.model';

interface Props {
    productId: string
};

const Modal = ({productId}: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')

  const openModal = ()=>setIsOpen(true);
  const closeModal = () => setIsOpen(false)
  
  const handleSubmit = async(e: SyntheticEvent<HTMLFormElement>) =>{
    e.preventDefault()
    setIsSubmitting(true)

    // add user email to product
    await addUserEmailToProduct(productId, email)
    

    setIsSubmitting(false)
    setEmail('')
    closeModal()
  }
  if (!mounted) return null; //prevent hydration mismatch

  return (
    <>
    <button type='button' className='mt-6 w-full py-3 rounded-xl bg-black text-white font-semibold text-sm tracking-wide hover:bg-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md' onClick={openModal}>
        Track
    </button>
    <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" onClose={closeModal} className="fixed inset-0 z-50">
          {/* <div className="min-h-screen px-4 text-center"> */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" /> 
            </TransitionChild>

            
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
              <DialogPanel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl z-100 relative">
  
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <Image 
                        src="/assets/icons/logo.svg"
                        alt="logo"
                        width={28}
                        height={28}
                      />
                    </div>

                    <Image 
                      src="/assets/icons/x-close.svg"
                      alt="close"
                      width={24}
                      height={24}
                      className="cursor-pointer"
                      onClick={closeModal}
                    />
                  </div>

                  <h4 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900 leading-snug tracking-tight">
                    Stay updated with product pricing alerts right in your inbox!
                  </h4>

                  <p className="text-sm text-gray-600 mt-2">
                    Never miss a bargain again with our timely alerts!
                  </p>
                </div>

                <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>

                  <div className="flex items-center gap-2 px-4 py-3 mt-2 border border-gray-300 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-black/80 transition">
                    <Image 
                      src="/assets/icons/mail.svg"
                      alt='mail'
                      width={18}
                      height={18}
                      className="opacity-60 shrink-0"
                    />

                    <input 
                      required
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className='flex items-center gap-2 px-4 py-3 mt-2 border border-gray-300 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-black/80 transition'
                    />
                  </div>

                  <button type="submit" className="mt-6 w-full py-3 rounded-xl bg-black text-white font-semibold text-sm tracking-wide hover:bg-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                    {isSubmitting ? 'Submitting...' : 'Track'}
                  </button>
                </form>

              </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>


    </>
  )
}

export default Modal