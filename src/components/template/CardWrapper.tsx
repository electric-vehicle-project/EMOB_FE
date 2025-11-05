import { Card } from "antd";
import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  variant?: "dashboard" | "default" | "profile";
  maxWidth?: string;
  children: ReactNode;
  className?: string;
}

export const CardWrapper = ({
  title,
  subtitle,
  variant = "default",
  children,
  className,
}: Props) => {
  return (
    <div className={`p-5 bg-gray-50 min-h-screen`}>
      <Card
        bordered={false}
        className={`shadow-md rounded-xl bg-white ${className ?? ""}`}
        style={{ width: "100%", maxWidth: "100%" }}
      >
        {(title || subtitle) && (
          <div
            className={`mb-4 ${
              variant === "dashboard"
                ? "border-b pb-3"
                : variant === "profile"
                ? "pb-1"
                : ""
            }`}
          >
            {title && (
              <h2 className="text-xl font-semibold text-[#627254]">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
            )}
          </div>
        )}

        <div>{children}</div>
      </Card>
    </div>
  );
};
