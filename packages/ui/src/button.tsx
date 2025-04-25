"use client";

import { Children, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode
  onClick?: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "text-sm px-3 py-1.5",
  medium: "text-base px-5 py-2.5",
  large: "text-lg px-6 py-3",
};

export const Button = ({
  children,
  onClick,
  className = "",
  size,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition
        ${sizeClasses[size]} ${className}
      `}
    >
      {children}
    </button>
  );
};
