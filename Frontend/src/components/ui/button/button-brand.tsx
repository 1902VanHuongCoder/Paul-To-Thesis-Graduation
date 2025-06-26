import { cn } from "@/lib/utils"; // Helper to combine class names
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "normal";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles =
    "group rounded-full flex items-center gap-x-2 font-bold font-sans focus:outline-none transition overflow-hidden cursor-pointer duration-200";

  // Variant styles
  const variantStyles = {
    primary: "bg-primary text-white",
    secondary: "bg-white text-primary",
    outline: "border border-primary text-gray-800 hover:bg-gray-100",
    ghost: "bg-transparent text-white border-[1px] border-secondary border-solid",
    normal: "bg-white text-black lowercase border-[1px] border-solid border-primary hover:bg-gray-100",
  };

  // Size styles
  const sizeStyles = {
    sm: "pl-2 pr-1 py-1 text-sm",
    md: "pl-4 pr-2 py-2",
    lg: "pl-5 pr-3 py-3 text-lg",
  };

  // Conditional styles for "normal" variant
  const normalVariantStyles =
    variant === "normal"
      ? {
          sm: "!pl-2 pr-4 py-2",
          md: "!pl-2 pr-4 py-2",
          lg: "!pl-2 pr-4 py-2",
        }[size]
      : "";

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        normalVariantStyles,
        className
      )}
      {...props}
    >
      <span className="relative z-2 group-hover:text-primary transition-all duration-500 pl-2 capitalize">
        {children}
      </span>
      {variant !== "normal" && (
        <span className="relative p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right-icon lucide-chevron-right text-primary relative z-2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="absolute top-0 left-0 w-full h-full bg-secondary rounded-full z-1 group-hover:scale-2000 duration-200"></span>
        </span>
      )}
    </button>
  );
}