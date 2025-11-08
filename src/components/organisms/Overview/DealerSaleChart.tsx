import { ResponsiveBar } from "@nivo/bar";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../atoms/Card";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#627254]/5 to-transparent rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-[#627254] to-[#76885b] rounded-full" />
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <Card>
          <CardContent className="h-[320px] relative z-10">
            <ResponsiveBar
              data={data}
              keys={["cars"]}
              indexBy="dealer"
              margin={{ top: 40, right: 30, bottom: 40, left: 60 }}
              padding={0.3}
              colors={["#627254"]}
              borderRadius={6}
              defs={[
                {
                  id: "gradient",
                  type: "linearGradient",
                  colors: [
                    { offset: 0, color: "#76885b", opacity: 1 },
                    { offset: 100, color: "#627254", opacity: 1 },
                  ],
                },
              ]}
              fill={[{ match: "*", id: "gradient" }] as any}
              axisBottom={{
                legend: "Đại lý",
                legendOffset: 32,
                legendPosition: "middle",
              }}
              axisLeft={{
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
                grid: { line: { stroke: "#e5e7eb" } },
                tooltip: {
                  container: { background: "#ffffff", color: "#111827" },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
