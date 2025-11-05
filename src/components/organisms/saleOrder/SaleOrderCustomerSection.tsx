// src/components/organisms/saleOrder/SaleOrderCustomerSection.tsx
import { useSaleOrdersByCustomerId } from "../../../service/saleOrderService";
import type { SaleOrderResponse } from "../../../model/SaleOrder";
import { SaleOrderTable } from "./SaleOrderTable";
import { Card } from "antd";

interface Props {
  customerId: string;
}

export const SaleOrderCustomerSection = ({ customerId }: Props) => {
  const { data, isLoading, isFetching } = useSaleOrdersByCustomerId(
    customerId,
    {
      page: 0,
      size: 10,
    }
  );

  const orders: SaleOrderResponse[] =
    ((data as any)?.result?.data as SaleOrderResponse[]) ?? [];

  return (
    <Card className="mt-6 shadow-md rounded-xl">
      <h3 className="text-lg font-semibold mb-4 text-[#627254]">
        Đơn hàng của khách hàng
      </h3>
      <SaleOrderTable
        data={orders}
        loading={isLoading || isFetching}
        canDelete={false}
        canComplete={false}
        onViewDetail={(id) => console.log("View SaleOrder", id)}
      />
    </Card>
  );
};
