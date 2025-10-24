import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";
import type { FC, ReactNode } from "react";

interface ButtonProps extends Omit<AntButtonProps, "type"> {
  /** Kiểu nút (mặc định, primary, dashed, link, text) */
  type?: "primary" | "default" | "dashed" | "link" | "text";
  /** Có phải nút nguy hiểm (màu đỏ) không */
  danger?: boolean;
  /** Thêm class tailwind tuỳ chỉnh */
  className?: string;
  /** Nội dung trong nút */
  children?: ReactNode;
}

export const Button: FC<ButtonProps> = ({ children, className, ...rest }) => (
  <AntButton
    {...rest}
    className={`hover-lift hover-elevate btn-press with-ripple ${
      className ? className : ""
    }`}
  >
    {children}
  </AntButton>
);
