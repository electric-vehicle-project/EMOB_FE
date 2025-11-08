import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={` bg-[var(--default-color)] rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
