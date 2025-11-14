import { Card } from "antd";
import { useSaleOrderListByCustomer } from "../../../service/saleOrderService";
import type { SaleOrderResponse } from "../../../model/SaleOrder";
import { SaleOrderTable } from "./SaleOrderTable";

interface Props {
  customerId: string;
}

export const SaleOrderCustomerSection: React.FC<Props> = ({ customerId }) => {
  // Gọi API lấy danh sách đơn hàng theo khách hàng
  const { data, isLoading, isFetching } = useSaleOrderListByCustomer(
    customerId,
    {
      page: 0,
      size: 10,
      sortField: "createdAt",
      sortDir: "desc",
    }
  );

  // Ép kiểu an toàn, tránh eslint lỗi "any"
  const orders: SaleOrderResponse[] =
    (data?.result?.data as SaleOrderResponse[]) ?? [];

  return (
    <Card className="mt-6 shadow-md rounded-xl">
      <h3 className="text-lg font-semibold mb-4 text-[#627254]">
        Đơn hàng của khách hàng
      </h3>
      <SaleOrderTable
        data={orders}
        loading={isLoading || isFetching}
        onViewDetail={(id) => console.log("View SaleOrder", id)}
      />
    </Card>
  );
};
