import { Segmented } from "antd";
import type { SegmentedValue } from "antd/es/segmented";
import type { OrderStatus } from "../../../model/SaleOrder";

interface Counts {
  all: number;
  created: number;
  completed: number;
  canceled: number;
}

interface Props {
  /** Tổng số lượng từng trạng thái */
  counts: Counts;

  /** Giá trị mặc định đang chọn */
  defaultStatus?: OrderStatus | "ALL";

  /** Callback khi người dùng chọn trạng thái khác */
  onStatusChange?: (status: OrderStatus | "ALL") => void;
}

/**
 * Thanh filter trạng thái đơn hàng (ALL / CREATED / COMPLETED / CANCELED)
 * - Hiển thị tổng số lượng từng loại
 * - Kết hợp với backend filter qua props `onStatusChange`
 */
export const SaleOrderFilterBar: React.FC<Props> = ({
  counts,
  defaultStatus = "ALL",
  onStatusChange,
}) => {
  const options = [
    { label: `Tất cả (${counts.all ?? 0})`, value: "ALL" },
    { label: `Đã tạo (${counts.created ?? 0})`, value: "CREATED" },
    { label: `Hoàn tất (${counts.completed ?? 0})`, value: "COMPLETED" },
    { label: `Đã huỷ (${counts.canceled ?? 0})`, value: "CANCELED" },
  ];

  return (
    <div className="mb-4 flex items-center justify-between">
      <Segmented
        options={options}
        value={defaultStatus}
        onChange={(v: SegmentedValue) =>
          onStatusChange?.(v as OrderStatus | "ALL")
        }
        className="!bg-white !shadow-sm !rounded-lg"
      />
    </div>
  );
};

export default SaleOrderFilterBar;
