// src/components/DangerButton.jsx
import React from "react";

export default function DangerButton({
  children = "Delete",
  onClick,
  className = "",
  variant = "solid", // "solid" | "outline"
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    solid:
      "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:opacity-90 focus:ring-red-500",
    outline:
      "border border-red-600 text-red-700 hover:bg-red-600 hover:text-white focus:ring-red-500",
  };

  const combined = `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <button onClick={onClick} className={combined} {...props}>
      {children}
    </button>
  );
}
