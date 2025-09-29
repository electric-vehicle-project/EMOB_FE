import { Button as AntButton } from "antd";
import type { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}

export const Button: FC<Props> = ({ children, href, onClick }) => (
  <AntButton type="primary" href={href} onClick={onClick}>
    {children}
  </AntButton>
);
