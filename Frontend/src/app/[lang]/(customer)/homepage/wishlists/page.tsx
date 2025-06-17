"use client";
import { Breadcrumb, WishlistPage } from '@/components'
import { useDictionary } from '@/contexts/dictonary-context'
import React from 'react'

const Wishlist = () => {
  const { dictionary: d } = useDictionary();
  return (
    <div className='py-10 px-6'>
      <Breadcrumb items={[{ label: d?.navHomepage || "Trang chủ", href: "/" }, { label: d?.wishlistPageTitle || "Danh sách yêu thích của bạn" }]} />
      <WishlistPage />
    </div>
  )
}

export default Wishlist