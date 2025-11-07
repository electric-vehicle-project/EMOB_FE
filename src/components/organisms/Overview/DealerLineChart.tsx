import { ResponsiveLine } from "@nivo/line";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../atoms/Card";

interface Props {
  data: any[];
  region: string;
  dealer?: string;
}

export default function RevenueLineChart({ data, region, dealer }: Props) {
  const title =
    dealer && dealer !== "Tất cả đại lý"
      ? `Doanh thu đại lý ${dealer}`
      : region && region !== "Tất cả khu vực"
      ? `Doanh thu khu vực ${region}`
      : "Tổng doanh thu";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      <Card>
        <CardContent className="h-[320px]">
          <ResponsiveLine
            data={data}
            margin={{ top: 40, right: 50, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            axisBottom={{
              legend: "Tháng",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              legend: "Doanh thu (USD)",
              legendOffset: -52,
              legendPosition: "middle",
            }}
            colors={["#22c55e"]}
            pointSize={10}
            pointColor="#22c55e"
            pointBorderWidth={2}
            enableArea
            areaOpacity={0.1}
            lineWidth={3}
            useMesh
            theme={{
              background: "#ffffff",
              textColor: "#374151",
              axis: {
                domain: { line: { stroke: "#d1d5db" } },
                ticks: {
                  line: { stroke: "#e5e7eb" },
                  text: { fill: "#374151" },
                },
              },
              grid: { line: { stroke: "#e5e7eb", strokeWidth: 1 } },
              tooltip: {
                container: {
                  background: "#ffffff",
                  color: "#111827",
                  fontSize: 12,
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
