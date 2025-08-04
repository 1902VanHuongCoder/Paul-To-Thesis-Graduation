import React from 'react'
import { Spinner } from '../spinner/spinner'

const ContentLoading = () => {
  return (
    <div className="fixed top-0 left-0 w-screen z-1000 p-8 flex justify-center items-center flex-col gap-y-2 h-screen bg-[rgba(0,0,0,0.5)] text-white"><Spinner variant="pinwheel" size={50} className="" stroke="#fff" /><p>Đang tải dữ liệu ...</p></div>
  )
}

export default ContentLoading