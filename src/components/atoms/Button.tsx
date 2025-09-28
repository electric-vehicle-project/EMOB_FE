import { FC, ReactNode } from "react";
import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";

interface ButtonProps extends Omit<AntButtonProps, "type"> {
  type?: "primary" | "default" | "dashed" | "link" | "text";
  children: ReactNode;
  className?: string;
}

export const Button: FC<ButtonProps> = ({ children, className, ...rest }) => {
  return (
    <AntButton className={className} {...rest}>
      {children}
    </AntButton>
  );
};
