import React from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import ChartContainer from "../atoms/ChartContainer";
type Props = {
  data?: any[];
};

const InventoryChart: React.FC<Props> = ({ data = [] }) => (
  <ChartContainer title="Biểu đồ nhập - xuất - tồn kho theo loại xe">
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="imported"
          stackId="1"
          stroke="#1890ff"
          fill="#1890ff"
          name="Nhập kho"
        />
        <Area
          type="monotone"
          dataKey="exported"
          stackId="1"
          stroke="#52c41a"
          fill="#52c41a"
          name="Xuất kho"
        />
        <Area
          type="monotone"
          dataKey="remaining"
          stackId="1"
          stroke="#faad14"
          fill="#faad14"
          name="Tồn kho"
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
);

export default InventoryChart;
