interface Props {
  metric: "totalRevenue" | "totalVehiclesPurchased";
  onChange: (m: "totalRevenue" | "totalVehiclesPurchased") => void;
}

export default function DealerCustomerToolbar({ metric, onChange }: Props) {
  const buttons = [
    {
      key: "totalRevenue",
      label: "Doanh thu",
      activeColor: "bg-emerald-500",
      hoverColor: "hover:bg-emerald-100",
    },
    {
      key: "totalVehiclesPurchased",
      label: "Xe mua",
      activeColor: "bg-sky-500",
      hoverColor: "hover:bg-sky-100",
    },
  ] as const;

  return (
    <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-inner">
      {buttons.map((btn) => {
        const isActive = metric === btn.key;
        return (
          <button
            key={btn.key}
            onClick={() => onChange(btn.key)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isActive
                ? `${
                    btn.activeColor
                  } text-white shadow-md ring-2 ring-offset-1 ring-${btn.activeColor.replace(
                    "bg-",
                    ""
                  )}-300`
                : `bg-white text-gray-600 ${btn.hoverColor}`
            }`}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}
