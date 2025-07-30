import { Breadcrumb, WishlistPage } from '@/components'
import React from 'react'

const Wishlist = () => {
  return (
    <div className='py-10 px-6'>
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Danh sách yêu thích của bạn" }]} />
      <WishlistPage />
    </div>
  )
}

export default Wishlist