"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
            <AnimatePresence>
                {showBubble && (<>
                    <motion.span
                        initial={{ opacity: 0, y: 0, scale: 0.7 }}
                        animate={{ opacity: 1, y: -28, scale: 1.25 }}
                        exit={{ opacity: 0, y: -40, scale: 0.9 }}
                        transition={{ duration: 0.7, type: 'spring', stiffness: 180, damping: 18 }}
                        className="absolute left-1/2 top-0 -translate-x-1/2 z-10"
                    >
                        <Heart className="w-4 h-4 text-red-400 fill-red-400 drop-shadow-lg" />
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 0, x: 18, scale: 0.7 }}
                        animate={{ opacity: 0.85, y: -24, x: 22, scale: 1.1 }}
                        exit={{ opacity: 0, y: -36, scale: 0.8 }}
                        transition={{ duration: 0.8, type: 'spring', stiffness: 160, damping: 20, delay: 0.18 }}
                        className="absolute left-1/2 top-0 -translate-x-1/2 z-10"
                    >
                        <Heart className="w-2.5 h-2.5 text-red-300 fill-red-300 drop-shadow-lg" />
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 0, x: -18, scale: 0.7 }}
                        animate={{ opacity: 0.9, y: -38, x: -20, scale: 1.35 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.9, type: 'spring', stiffness: 140, damping: 22, delay: 0.32 }}
                        className="absolute left-1/2 top-0 -translate-x-1/2 z-10"
                    >
                        <Heart className="w-3 h-3 text-red-300 fill-red-300 drop-shadow-lg" />
                    </motion.span>
                </>) }
            </AnimatePresence>
        </button>
    )
}

export default HeartButton