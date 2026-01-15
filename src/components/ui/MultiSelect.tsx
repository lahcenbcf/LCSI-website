"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  className = "",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const option = options.find((o) => o.value === value[0]);
      return option?.label || value[0];
    }
    return `${value.length} sélectionné${value.length > 1 ? "s" : ""}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-grayRectangle rounded-lg border-none focus:ring-2 focus:ring-mainBlue focus:bg-white transition-all duration-200 text-left flex items-center justify-between"
      >
        <span
          className={
            value.length === 0 ? "text-lightgrayTxt" : "text-darkgrayTxt"
          }
        >
          {getDisplayText()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
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
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-grayBorder rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggle(option.value)}
                className="w-full px-4 py-3 text-left hover:bg-grayRectangle flex items-center justify-between"
              >
                <span>{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="w-4 h-4 text-mainBlue" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
