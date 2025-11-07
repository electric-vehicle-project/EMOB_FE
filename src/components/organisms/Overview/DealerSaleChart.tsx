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
      className="bg-white rounded-2xl shadow-md p-6"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      <Card>
        <CardContent className="h-[320px]">
          <ResponsiveBar
            data={data}
            keys={["cars"]}
            indexBy="dealer"
            margin={{ top: 40, right: 30, bottom: 40, left: 60 }}
            padding={0.3}
            colors={["#3b82f6"]}
            borderRadius={4}
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
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
