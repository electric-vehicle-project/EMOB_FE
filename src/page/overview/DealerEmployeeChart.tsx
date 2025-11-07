import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent } from "../../components/atoms/Card";

export interface EmployeeData {
  accountId: string;
  orderCount: number;
  amount: number;
}

export interface Props {
  data: EmployeeData[];
  metric: "amount" | "orderCount";
}

export default function DealerEmployeeChart({ data, metric }: Props) {
  const chartData = data.map((d, i) => ({
    name: `Nhân Viên ${i + 1}`,
    revenue: d.amount,
    orders: d.orderCount,
  }));

  return (
    <Card>
      <CardContent className="h-[350px]">
        <ResponsiveBar
          data={chartData}
          keys={[metric === "amount" ? "revenue" : "orders"]}
          indexBy="name"
          margin={{ top: 40, right: 40, bottom: 60, left: 70 }}
          padding={0.3}
          colors={metric === "amount" ? ["#10b981"] : ["#3b82f6"]}
          borderRadius={4}
          axisBottom={{
            legend: "Nhân viên bán hàng",
            legendOffset: 45,
            legendPosition: "middle",
            tickRotation: -15,
          }}
          axisLeft={{
            legend: metric === "amount" ? "Doanh thu (USD)" : "Số đơn hàng",
            legendOffset: -50,
            legendPosition: "middle",
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="#ffffff"
          animate
          motionConfig="gentle"
          theme={{
            background: "#ffffff",
            textColor: "#374151",
            axis: {
              domain: { line: { stroke: "#d1d5db" } },
              ticks: { text: { fill: "#374151" } },
            },
            grid: { line: { stroke: "#e5e7eb" } },
            tooltip: {
              container: { background: "#ffffff", color: "#111827" },
            },
          }}
          tooltip={({ indexValue, value }) => (
            <div className="p-2 text-sm">
              <strong>{indexValue}</strong>
              <div>
                {metric === "amount"
                  ? `Doanh thu: ${value?.toLocaleString()} USD`
                  : `Số đơn hàng: ${value}`}
              </div>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
