// src/components/template/CardWrapper.tsx

import { Card } from "antd";
import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  rightLink?: ReactNode; // 👈 thêm mới
  variant?: "dashboard" | "default" | "profile";
  maxWidth?: string;
  children: ReactNode;
  className?: string;
}

export const CardWrapper = ({
  title,
  subtitle,
  rightLink,
  variant = "default",
  children,
  className,
}: Props) => {
  return (
    <div className={`p-5 bg-transparent min-h-screen`}>
      <Card
        bordered={false}
        className={`shadow-md rounded-xl bg-white ${className ?? ""}`}
        style={{ width: "100%", maxWidth: "100%" }}
      >
        {(title || subtitle || rightLink) && (
          <div
            className={`mb-4 ${
              variant === "dashboard"
                ? "border-b pb-3"
                : variant === "profile"
                ? "pb-1"
                : ""
            }`}
          >
            {/* ================= TOP BAR: TITLE + RIGHT LINK ================= */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && (
                  <h2 className="text-xl font-semibold text-[#627254]">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
                )}
              </div>

              {/* Link nằm góc phải – không đẩy search xuống */}
              {rightLink && (
                <div
                  className="ml-4 mt-1 text-right underline 
                text-[#627254] cursor-pointer hover:text-[#4f5a42] transition-colors"
                >
                  {rightLink}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= CONTENT ================= */}
        <div>{children}</div>
      </Card>
    </div>
  );
};
