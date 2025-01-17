import React from "react";

import { referencer } from "../helpers/constants";

export const Pill = ({ option, isActive, onClick }) => {
  const { label, value } = option;
  const pillColors = {
    race: "bg-[#5778a4] text-white",
    income: "bg-[#e49444] text-white",
    gender: "bg-[#85b6b2] text-white",
  };
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
        ${
          isActive
            ? Object.keys(pillColors).includes(value)
              ? pillColors[value]
              : "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export const PillGroup = ({ options, activeOptions, onOptionToggle }) => {
  return (
    <div className='flex gap-2'>
      {options.map((option) => {
        const { label, value } = option;
        return (
          <Pill
            key={label}
            option={option}
            isActive={activeOptions.includes(value)}
            onClick={() => onOptionToggle(value)}
          />
        );
      })}
    </div>
  );
};
