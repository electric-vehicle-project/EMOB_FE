import { Card } from "antd";
import React, { type ReactNode } from "react";

export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}
const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
  return (
    <Card
      title={<span className="font-semibold text-blue-600">{title}</span>}
      style={{ marginBottom: 30 }}
    >
      {children}
    </Card>
  );
};

export default ChartContainer;
