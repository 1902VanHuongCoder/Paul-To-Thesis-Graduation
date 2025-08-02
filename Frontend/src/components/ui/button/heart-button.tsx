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
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}
                    >
                        <Heart style={{
                            width: '1rem',
                            height: '1rem',
                            color: '#f87171',
                            filter: 'drop-shadow(0 1px 4px #f87171)',
                            fill: '#f87171',
                        }} />
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 0, x: 18, scale: 0.7 }}
                        animate={{ opacity: 0.85, y: -24, x: 22, scale: 1.1 }}
                        exit={{ opacity: 0, y: -36, scale: 0.8 }}
                        transition={{ duration: 0.8, type: 'spring', stiffness: 160, damping: 20, delay: 0.18 }}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}
                    >
                        <Heart style={{
                            width: '1.1rem',
                            height: '1.1rem',
                            color: '#fca5a5',
                            filter: 'drop-shadow(0 1px 4px #fca5a5)',
                            fill: '#fca5a5',
                        }} />
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, y: 0, x: -18, scale: 0.7 }}
                        animate={{ opacity: 0.9, y: -38, x: -20, scale: 1.35 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.9, type: 'spring', stiffness: 140, damping: 22, delay: 0.32 }}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}
                    >
                        <Heart style={{
                            width: '0.75rem',
                            height: '0.75rem',
                            color: '#fca5a5',
                            filter: 'drop-shadow(0 1px 4px #fca5a5)',
                            fill: '#fca5a5',
                        }} />
                    </motion.span>
                </>) }
            </AnimatePresence>
        </button>
    )
}

export default HeartButton