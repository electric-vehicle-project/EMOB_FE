import { ResponsivePie } from "@nivo/pie";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../atoms/Card";

interface Props {
  data: any[];
}

export default function DealerContractPie({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Tỷ lệ hợp đồng đã ký / chờ ký
      </h2>
      <Card>
        <CardContent className="h-[320px]">
          <ResponsivePie
            data={data}
            margin={{ top: 40, right: 80, bottom: 60, left: 80 }}
            innerRadius={0.6}
            padAngle={3}
            cornerRadius={5}
            colors={["#34d399", "#f87171"]}
            borderWidth={2}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsTextColor="#374151"
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            theme={{
              background: "#ffffff",
              textColor: "#374151",
              tooltip: {
                container: { background: "#ffffff", color: "#111827" },
              },
              legends: { text: { fill: "#374151" } },
            }}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                translateY: 56,
                itemWidth: 100,
                itemHeight: 18,
                symbolSize: 18,
              },
            ]}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
