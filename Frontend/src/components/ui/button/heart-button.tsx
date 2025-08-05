"use client"
import React, { useState } from 'react'
// Removed framer-motion. Will use manual animation.
import { Heart } from 'lucide-react'

interface HeartButtonProps {
    onClick?: () => void
}

const HeartButton: React.FC<HeartButtonProps> = ({ onClick }) => {
    const [showBubble, setShowBubble] = useState(false)

    const handleClick = () => {
        setShowBubble(true)
        if (onClick) onClick()
        setTimeout(() => setShowBubble(false), 600)
    }

    return (
        <button
            type="button"
            className="relative flex items-center justify-center p-3 rounded-full hover:bg-red-50 transition cursor-pointer border-1 border-red-500"
            onClick={handleClick}
            aria-label="Like"
        >
            <Heart className="w-6 h-6 text-red-500 fill-red-500 " />
            {showBubble && (
                <span
                    className="absolute left-1/2 top-0 -translate-x-1/2 z-10"
                    style={{
                        opacity: showBubble ? 1 : 0,
                        transform: showBubble ? 'translateY(-20px) scale(1.2)' : 'translateY(0) scale(0.7)',
                        transition: 'opacity 0.6s, transform 0.6s',
                    }}
                >
                    <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-bounce" />
                </span>
            )}
        </button>
    )
}

export default HeartButton
