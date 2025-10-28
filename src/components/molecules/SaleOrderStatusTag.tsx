import { Tag } from "antd";
import { SaleOrderStatus } from "../../model/SaleOrder";

export const SaleOrderStatusTag = ({ status }: { status: string }) => {
  switch (status) {
    case SaleOrderStatus.CREATED:
      return <Tag color="blue">Created</Tag>;
    case SaleOrderStatus.COMPLETED:
      return <Tag color="green">Completed</Tag>;
    case SaleOrderStatus.CANCELED:
      return <Tag color="red">Canceled</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};
