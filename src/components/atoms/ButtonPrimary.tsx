import React from "react";
import { Button } from "antd";
import type { ButtonProps } from "antd";

type Props = ButtonProps & {
  children: React.ReactNode;
};

export const ButtonPrimary: React.FC<Props> = ({ children, ...props }) => (
  <Button type="primary" className={`${props.className || ""}`} {...props}>
    {children}
  </Button>
);
