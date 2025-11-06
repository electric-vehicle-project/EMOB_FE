import { Tag } from "antd";
import type { OrderStatus } from "../../../model/SaleOrder";

interface Props {
  status: OrderStatus;
}

export const SaleOrderStatusTag: React.FC<Props> = ({ status }) => {
  switch (status) {
    case "CREATED":
      return <Tag color="processing">Đã tạo</Tag>;
    case "COMPLETED":
      return <Tag color="success">Hoàn tất</Tag>;
    case "CANCELED":
      return <Tag color="error">Đã hủy</Tag>;
    default:
      return <Tag color="default">Không xác định</Tag>;
  }
};
