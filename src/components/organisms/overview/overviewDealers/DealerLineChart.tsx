/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponsiveLine } from "@nivo/line";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../../atoms/Card";

interface Props {
  data: any[];
  region?: string;
  country?: string;
}

export default function RevenueLineChart({ data, region, country }: Props) {
  const title = (() => {
    if (country && country !== "Tất cả địa chỉ") {
      return `Doanh thu đại lý ${country}`;
    }
    if (region && region !== "Tất cả khu vực") {
      return `Doanh thu khu vực ${region}`;
    }
    return "Tổng doanh thu";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#627254]/10 to-transparent rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-[#627254] to-[#76885b] rounded-full" />
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <Card>
          <CardContent className="h-[320px] relative z-10">
            <ResponsiveLine
              data={data}
              margin={{ top: 40, right: 50, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: "auto" }}
              axisBottom={{
                legend: "Năm",
                legendOffset: 36,
                legendPosition: "middle",
              }}
              yFormat={(v) => {
                if (v >= 1000000000) return v / 1000000000 + " tỷ";
                if (v >= 1000000) return v / 1000000 + " triệu";
                if (v >= 1000) return v / 1000 + " nghìn";
                return v;
              }}
              axisLeft={{
                legend: "Doanh thu (VND)",
                legendOffset: -52,
                legendPosition: "middle",
                tickRotation: -35,
                tickPadding: 6,
                format: (v) => {
                  if (v >= 1000000000) return v / 1000000000 + " tỷ";
                  if (v >= 1000000) return v / 1000000 + " triệu";
                  if (v >= 1000) return v / 1000 + " nghìn";
                  return v;
                },
              }}
              animate
              motionConfig="gentle"
              curve="monotoneX"
              colors={["#627254"]}
              pointSize={10}
              pointColor="#627254"
              pointBorderWidth={2}
              enableArea
              areaOpacity={0.15}
              lineWidth={3}
              defs={[
                {
                  id: "gradient",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#627254", opacity: 0.3 },
                    { offset: 100, color: "#627254", opacity: 0.05 },
                  ],
                },
              ]}
              fill={[{ match: "*", id: "gradient" }]}
              useMesh
              theme={{
                background: "#ffffff",
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
      </div>
    </motion.div>
  );
}
