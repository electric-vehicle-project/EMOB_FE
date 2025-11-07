interface Props {
  metric: "amount" | "orderCount";
  onChange: (metric: "amount" | "orderCount") => void;
}

export default function DealerEmployeeToolbar({ metric, onChange }: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange("amount")}
        className={`px-3 py-1 text-sm rounded-lg transition ${
          metric === "amount"
            ? "bg-emerald-500 text-white shadow"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        💰 Doanh thu
      </button>

      <button
        onClick={() => onChange("orderCount")}
        className={`px-3 py-1 text-sm rounded-lg transition ${
          metric === "orderCount"
            ? "bg-sky-500 text-white shadow"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        🧾 Số đơn
      </button>
    </div>
  );
}
