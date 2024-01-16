import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Header = () => {
  return (
    <header className='w-11/12 mx-auto h-36 rounded-md mt-10 grid grid-cols-12 grid-rows-1 bg-[#8c74b3] p-10'>
        <Link href='/' className='col-start-1 col-span-2 self-center'>
        <Image
        src='/images/mau.png'
        alt='logo'
        width={250}
        height={250}
        className='min-w-[100px]'
         />
        </Link>
       
         <Link href='bechduri' className='col-start-4 text-white self-center tracking-wider flex justify-center items-center'>ბეჭდური</Link>
         <Link href='video' className='col-start-5 text-white self-center tracking-wider flex justify-center items-center'>ვიდეო</Link>
         <Link href='#' className='col-start-6 text-white self-center tracking-wider flex justify-center items-center'>პოდკასტი</Link>
         <Link href='#' className='col-start-7 text-white self-center tracking-wider flex justify-center items-center'>დონაცია</Link>
         <div className='col-start-9 col-span-3 flex items-center justify-center'>
        <input
          type='text'
          placeholder='ძებნა'
          className='p-2 border w-full border-gray-300 rounded-md focus:outline-none focus:border-purple-500 '
        />
        {/* You can add a search icon or button here if needed */}
      </div>
    </header>
  )
}

export default Header