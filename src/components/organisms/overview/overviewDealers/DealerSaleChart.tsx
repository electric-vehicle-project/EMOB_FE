/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponsiveBar } from "@nivo/bar";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../../atoms/Card";

interface Props {
  data: any[];
  region: string;
}

export default function DealerSalesChart({ data, region }: Props) {
  const title =
    region && region !== "Tất cả khu vực"
      ? `Số xe bán ra theo đại lý (${region})`
      : "Số xe bán ra theo đại lý";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 24px rgba(98, 114, 84, 0.25)",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden cursor-pointer"
    >
      {/* Hiệu ứng nền nhẹ */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#627254]/10 to-transparent rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-[#627254] to-[#76885b] rounded-full" />
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>

        <Card>
          <CardContent className="h-[340px] relative z-10">
            <ResponsiveBar
              data={data}
              keys={["cars"]}
              indexBy="dealer"
              margin={{ top: 40, right: 30, bottom: 50, left: 60 }}
              padding={0.3}
              colors={["#627254"]}
              borderRadius={6}
              enableGridY={true}
              animate
              motionConfig="gentle"
              defs={[
                {
                  id: "gradient",
                  type: "#9fb87a",
                  // colors: [{ offset: 0, color: "#9fb87a", opacity: 1 }],
                },
              ]}
              fill={[{ match: "*", id: "gradient" }] as any}
              axisLeft={{
                tickValues: "every 1",
                legend: "Xe bán ra",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              theme={{
                background: "#ffffff",
                axis: {
                  domain: { line: { stroke: "#d1d5db" } },
                  ticks: { text: { fill: "#374151" } },
                },
                grid: { line: { stroke: "#e5e7eb", strokeWidth: 1 } },
                tooltip: {
                  container: {
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: 12,
                    padding: "6px 10px",
                  },
                },
              }}
              tooltip={({ value, indexValue }) => (
                <div className="p-2 text-sm bg-white rounded-md shadow-md border border-gray-100">
                  <strong>{indexValue}</strong>
                  <div className="text-[#627254] font-semibold">
                    {value?.toLocaleString("vi-VN")} xe
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
