import { useState } from "react";
import { motion } from "framer-motion";
import DealerEmployeeToolbar from "./DealerEmployeeToolbar";
import DealerEmployeeChart from "./DealerEmployeeChart";

interface EmployeeData {
  accountId: string;
  orderCount: number;
  amount: number;
}

interface Props {
  data: EmployeeData[];
  dealer: string;
}

export default function DealerEmployeeCard({ data, dealer }: Props) {
  const [metric, setMetric] = useState<"amount" | "orderCount">("amount");

  const title =
    metric === "amount"
      ? `Doanh thu theo nhân viên (${dealer})`
      : `Số đơn hàng theo nhân viên (${dealer})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <DealerEmployeeToolbar metric={metric} onChange={setMetric} />
      </div>

      <DealerEmployeeChart data={data} dealer={metric} />
    </motion.div>
  );
}
