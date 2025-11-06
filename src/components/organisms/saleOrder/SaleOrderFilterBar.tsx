import { Segmented } from "antd";
import type { SegmentedValue } from "antd/es/segmented";
import type { OrderStatus } from "../../../model/SaleOrder";

type Counts = {
  all: number;
  created: number;
  completed: number;
  canceled: number;
};

interface Props {
  counts: Counts;
  defaultStatus?: OrderStatus | "ALL";
  onStatusChange?: (s: OrderStatus | "ALL") => void;
}

export const SaleOrderFilterBar: React.FC<Props> = ({
  counts,
  defaultStatus = "ALL",
  onStatusChange,
}) => {
  const items = [
    { label: `Tất cả (${counts.all})`, value: "ALL" },
    { label: `Đã tạo (${counts.created})`, value: "CREATED" },
    { label: `Hoàn tất (${counts.completed})`, value: "COMPLETED" },
    { label: `Đã hủy (${counts.canceled})`, value: "CANCELED" },
  ];

  return (
    <div className="mb-4 flex items-center justify-between">
      <Segmented
        value={defaultStatus}
        onChange={(v: SegmentedValue) => onStatusChange?.(v as any)}
        options={items}
        className="!bg-white !shadow-sm"
      />
    </div>
  );
};
