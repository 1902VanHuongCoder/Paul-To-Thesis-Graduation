"use client";

import React, { useRef, useState } from "react";
// Removed framer-motion. Will use manual animation.

interface LensProps {
    children: React.ReactNode;
    zoomFactor?: number;
    lensSize?: number;
    position?: {
        x: number;
        y: number;
    };
    isStatic?: boolean;
    isFocusing?: () => void;
    hovering?: boolean;
    setHovering?: (hovering: boolean) => void;
}

export const Lens: React.FC<LensProps> = ({
    children,
    zoomFactor = 1.5,
    lensSize = 170,
    isStatic = false,
    position = { x: 200, y: 150 },
    hovering,
    setHovering,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // ...existing code...
    // Replace framer-motion animation with CSS transitions below in the render

    const [localIsHovering, setLocalIsHovering] = useState(false);

    const isHovering = hovering !== undefined ? hovering : localIsHovering;
    const setIsHovering = setHovering || setLocalIsHovering;

    // const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg z-20"
            onMouseEnter={() => {
                setIsHovering(true);
            }}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
        >
            {children}
            {isStatic ? (
                <div>
                    <div
                        className="absolute inset-0 overflow-hidden transition-all duration-300"
                        style={{
                            maskImage: `radial-gradient(circle ${lensSize / 2}px at ${position.x}px ${position.y}px, black 100%, transparent 100%)`,
                            WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${position.x}px ${position.y}px, black 100%, transparent 100%)`,
                            transformOrigin: `${position.x}px ${position.y}px`,
                            opacity: 1,
                        }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `scale(${zoomFactor})`,
                                transformOrigin: `${position.x}px ${position.y}px`,
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            ) : null}
            {!isStatic && isHovering ? (
                <div>
                    <div
                        className="absolute inset-0 overflow-hidden transition-all duration-300"
                        style={{
                            maskImage: `radial-gradient(circle ${lensSize / 2}px at ${mousePosition.x}px ${mousePosition.y}px, black 100%, transparent 100%)`,
                            WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${mousePosition.x}px ${mousePosition.y}px, black 100%, transparent 100%)`,
                            transformOrigin: `${mousePosition.x}px ${mousePosition.y}px`,
                            opacity: 1,
                            zIndex: 50,
                        }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `scale(${zoomFactor})`,
                                transformOrigin: `${mousePosition.x}px ${mousePosition.y}px`,
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
