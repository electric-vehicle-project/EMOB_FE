import { Skeleton, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerById } from "../../../service/customerService";
import { useSaleOrderListByCustomer } from "../../../service/saleOrderService";
import { CustomerInfoCard } from "../../molecules/customer/CustomerInfoCard";
import { SaleOrderSubtable } from "../../molecules/customer/SaleOrderSubtable";
import type { ICustomer } from "../../../model/Customer";

export const CustomerDetailContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Lấy dữ liệu khách hàng
  const { data: customerData, isLoading: loadingCustomer } = useCustomerById(
    id || ""
  );
  const customer: ICustomer | undefined = customerData?.result;

  // Lấy danh sách đơn hàng của khách hàng
  const { data: saleOrderData, isLoading: loadingOrders } =
    useSaleOrderListByCustomer(id || "", {
      page: 0,
      size: 10,
      sortField: "createdAt",
      sortDir: "desc",
    });

  const saleOrders = saleOrderData?.result?.data || [];

  if (loadingCustomer || !customer) return <Skeleton active />;

  // Giao diện
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="!bg-[#627254] !text-white hover:!bg-[#4f6f52] rounded-lg"
        >
          Quay lại
        </Button>
      </div>

      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Thông tin khách hàng
      </h2>
      <CustomerInfoCard customer={customer} />

      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Đơn hàng của khách hàng
      </h2>
      <SaleOrderSubtable orders={saleOrders} loading={loadingOrders} />
    </>
  );
};
