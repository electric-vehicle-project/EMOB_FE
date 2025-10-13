import { FC, ReactNode } from "react";
import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";

interface ButtonProps extends Omit<AntButtonProps, "type"> {
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean;
  className?: string;
}

export const Button: FC<Props> = ({ children, className, ...rest }) => (
  <AntButton
    {...rest}
    className={`hover-lift hover-elevate btn-press with-ripple ${
      className ? className : ""
    }`}
  >
    {children}
  </AntButton>
);
