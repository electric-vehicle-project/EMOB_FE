import { motion } from "framer-motion";

interface Props {
  title: string;
  value: string;
  sub?: string;
  icon?: string;
  color: string; // ví dụ: "from-emerald-400 to-teal-500"
}

export default function DealerKPI({ title, value, sub, icon, color }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl shadow-md bg-gradient-to-br ${color} text-white relative overflow-hidden`}
    >
      {/* Hiệu ứng background mờ phía sau (blur overlay) */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

      {/* Nội dung KPI */}
      <div className="relative flex items-center justify-between">
        <div>
          <h3 className="text-sm text-white/80 font-medium">{title}</h3>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
        </div>

        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 text-white text-xl font-semibold shadow-inner">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
