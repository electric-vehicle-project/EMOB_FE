import { Skeleton } from "antd";
import { useParams } from "react-router-dom";
import { useCustomerById } from "../../../service/customerService";
import { useQuery } from "@tanstack/react-query";
import { CustomerInfoCard } from "../../molecules/customer/CustomerInfoCard";
import { SaleOrderSubtable } from "../../molecules/customer/SaleOrderSubtable";
import type { ICustomer } from "../../../model/Customer";
import api from "../../../config/api";

interface SaleOrder {
  id: string;
  totalPrice: number;
  vatAmount: number;
  totalQuantity: number;
  status: string;
  createdAt: string;
}

export const CustomerDetailContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customerData, isLoading: loadingCustomer } = useCustomerById(
    id || ""
  );
  const customer: ICustomer | undefined = customerData?.result;

  const { data: saleOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ["saleOrdersByCustomer", id],
    queryFn: async () => {
      const res = await api.get(`/sale-order/customers/${id}`, {
        params: { page: 0, size: 10, sortField: "createdAt", sortDir: "desc" },
      });
      return res.data?.result?.data as SaleOrder[];
    },
    enabled: !!id,
  });

  if (loadingCustomer || !customer) return <Skeleton active />;

  return (
    <>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Thông tin khách hàng
      </h2>
      <CustomerInfoCard customer={customer} />

      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Đơn hàng của khách hàng
      </h2>
      <SaleOrderSubtable orders={saleOrders || []} loading={loadingOrders} />
    </>
  );
};
