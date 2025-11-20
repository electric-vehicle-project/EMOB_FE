/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponsivePie } from "@nivo/pie";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../../atoms/Card";

interface Props {
  data: any[];
}

export default function DealerContractPie({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 25px rgba(98, 114, 84, 0.25)",
      }}
      transition={{ type: "spring", stiffness: 180, damping: 15 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#627254]/10 to-transparent rounded-full blur-3xl -z-0" />

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
              cornerRadius={6}
              activeOuterRadiusOffset={10} // 🟢 Hiệu ứng phóng to khi hover
              colors={["#627254", "#9fb87a"]}
              borderWidth={2}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              enableArcLabels={true}
              arcLinkLabelsTextColor="#374151"
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              animate={true}
              motionConfig="gentle"
              theme={{
                background: "#ffffff",
                tooltip: {
                  container: {
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
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
                  symbolShape: "circle",
                  effects: [
                    {
                      on: "hover",
                      style: { itemTextColor: "#627254" },
                    },
                  ],
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
