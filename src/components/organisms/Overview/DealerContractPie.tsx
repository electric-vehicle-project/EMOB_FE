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
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#627254]/5 to-transparent rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-[#627254] to-[#76885b] rounded-full" />
          <h2 className="text-xl font-bold text-gray-800">
            Tỷ lệ hợp đồng đã ký / chờ ký
          </h2>
        </div>
        <Card>
          <CardContent className="h-[320px] relative z-10">
            <ResponsivePie
              data={data}
              margin={{ top: 40, right: 80, bottom: 60, left: 80 }}
              innerRadius={0.6}
              padAngle={3}
              cornerRadius={5}
              colors={["#627254", "#76885b"]}
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
      </div>
    </motion.div>
  );
}
