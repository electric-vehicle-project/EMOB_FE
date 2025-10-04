import { Button as AntButton } from "antd";
import type { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
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
