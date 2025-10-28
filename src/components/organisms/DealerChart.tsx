import React from "react";
import ChartContainer from "../atoms/ChartContainer";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from "recharts";

type Props = {
  data?: any[];
};

const DealerChart: React.FC<Props> = ({ data = [] }) => (
  <ChartContainer title="Doanh số & Công nợ theo khu vực đại lý">
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="region" />
        <YAxis />
        <Tooltip />
        <Legend />
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#627254" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#627254" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#faad14" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#faad14" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#627254"
          fill="#627254"
          name="Doanh số"
          fillOpacity={1}
        />
        <Area
          type="monotone"
          dataKey="debt"
          stroke="#faad14"
          fill="#faad14"
          name="Công nợ"
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
);

export default DealerChart;
