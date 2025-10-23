import { Card, Statistic } from "antd";
import React from "react";

export interface TitleProps {
  title: string;
  value: number | string;
}

const CardTitle: React.FC<TitleProps> = ({ title, value }) => {
  return (
    <Card className="rounded-xl shadow-md border-l-4 border-blue-600 hover:shadow-lg transition-all">
      <Statistic
        title={title}
        value={value}
        valueStyle={{ color: "#1E3A8A" }}
      />
    </Card>
  );
};

export default CardTitle;
