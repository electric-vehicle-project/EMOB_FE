import { motion } from "framer-motion";

interface Props {
  title: string;
  value: string;
  sub?: string;
  icon?: any;
  gradient: string; // ví dụ: "from-[#627254] to-[#76885b]"
  bgGradient?: string;
}

export default function DealerKPI({
  title,
  value,
  sub,
  icon: Icon,
  gradient,
  bgGradient,
}: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {/* Background gradient với overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-95`}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />

      {/* Nội dung KPI */}
      <div className="relative p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/90 mb-1 uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {sub && (
              <p className="text-xs text-white/75 mt-2 font-medium">{sub}</p>
            )}
          </div>

          {/* Icon container */}
          {Icon && (
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg"
            >
              <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </motion.div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </motion.div>
  );
}
