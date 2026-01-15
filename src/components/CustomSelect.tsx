"use client";

import React from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange?: (value: string) => void;
  options: Option[];
  className?: string;
  width?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange = () => {},
  options,
  className = "",
  width = "w-full sm:w-64",
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none ${width} px-4 py-2.5 pr-10 text-sm font-medium text-black bg-[#E6F0FF] border-0 focus:outline-none cursor-pointer ${className}`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-black bg-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default CustomSelect;
