import React from "react";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon; // Icon component from lucide-react
  iconColor?: string; // Tailwind color class for the icon
  backgroundColor?: string; // Tailwind color class for the background
  onClick?: () => void; // Optional click handler
  className?: string; // Additional custom classes
}

export default function IconButton({
  icon: Icon,
  iconColor = "text-black",
  backgroundColor = "bg-gray-200",
  onClick,
  className = "",
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full flex items-center justify-center ${className} bg-${backgroundColor}`}
    >
      <Icon fill={iconColor} className={`w-5 h-5 text-${iconColor}`} stroke={iconColor}/>
    </button>
  );
}