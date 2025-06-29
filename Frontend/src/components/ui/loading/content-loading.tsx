import React from 'react'
import { Spinner } from '../spinner/spinner'

const ContentLoading = () => {
  return (
    <div className="p-8 flex justify-center items-center flex-col gap-y-2 h-[400px]"><Spinner variant="pinwheel" size={50} className="" stroke="#000" /><p>Đang tải dữ liệu ...</p></div>
  )
}

export default ContentLoading