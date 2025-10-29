import React from "react";
import { motion } from "framer-motion";

export interface CardWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  variant?: "profile" | "dashboard";
}
const CardWrapper: React.FC<CardWrapperProps> = ({
  title,
  subtitle,
  children,
  maxWidth,
  variant = "dashboard",
}) => {
  const containerMaxWidth =
    maxWidth || (variant === "profile" ? "max-w-5xl" : "max-w-6xl");

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-start bg-[var(--neutural-color)] p-4 sm:p-6 md:p-8 font-[Inter,sans-serif]">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`${containerMaxWidth} w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10`}
      >
        <div className="border-l-4 border-[#627254] pl-4 mb-6">
          <h1 className="text-2xl font-semibold text-[#414d38]">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="space-y-6">{children}</div>
      </motion.div>
    </div>
  );
};

export default CardWrapper;
