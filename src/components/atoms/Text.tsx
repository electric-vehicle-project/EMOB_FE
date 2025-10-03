import { Typography } from "antd";
import type { ReactNode } from "react";

const { Text: AntText } = Typography;

interface Props {
  children: ReactNode;
  className?: string;
}

export const Text = ({ children, className }: Props) => (
  <AntText className={className}>{children}</AntText>
);
