// src/components/ExtraButton.jsx
import React from "react";


export default function ExtraButton({
  children = "Learn More",
  onClick,
  href,
  className = "",
  variant = "outline", // "solid" | "outline" | "ghost"
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition duration-200 text-sm";

  const variants = {
    solid:
      "bg-gradient-to-r from-green-700 to-amber-800 text-white shadow-md hover:opacity-90",
    outline:
      "border border-green-700 text-green-700 hover:bg-green-700 hover:text-white",
    ghost:
      "text-green-700 hover:bg-green-50"
  };

  const combined = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} onClick={onClick} className={combined} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={combined} {...props}>
      {children}
    </button>
  );
}
