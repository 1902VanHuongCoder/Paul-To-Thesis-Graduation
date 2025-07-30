import Image from 'next/image';
import React from 'react'
import toast from 'react-hot-toast';

const CustomToast = ({t, type, username, createdAt, userAvatar} : {t: {visible: boolean, id: string}, type: string, username: string | undefined, createdAt: string, userAvatar: string | undefined}) => {
  return (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        {userAvatar ? (
                            <Image
                                className="h-10 w-10 rounded-full"
                                src={userAvatar}
                                alt={username ? username : 'User Avatar'}
                                width={40}
                                height={40}
                            />
                        ) : (
                            <span className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                                </svg>
                            </span>
                        )}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {username ? `Thông báo từ ${username}` : 'Thông báo'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {type === 'order' ? 'Vừa có người dùng đặt hàng lúc' : 'Vừa có tin nhắn mới lúc'} {new Date(createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })} giờ
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200">
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Đóng
                </button>
            </div>
        </div>
    )
}

export default CustomToast