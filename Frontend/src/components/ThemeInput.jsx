import React from "react";

export default function ThemeInput({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  className = "",
  ...props
}) {
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full px-4 py-2 rounded-lg border 
          border-gray-300 bg-white text-gray-900
          placeholder-gray-400
          focus:outline-none focus:ring-2 
          focus:ring-green-500 focus:border-green-500
          transition
        "
        {...props}
      />
    </div>
  );
}
