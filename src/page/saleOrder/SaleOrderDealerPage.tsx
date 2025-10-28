import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  useSaleOrderOfDealer,
  useSaleOrderComplete,
  useSaleOrderDelete,
} from "../../service/saleOrderService";
import { SaleOrderTable } from "../../components/organisms/SaleOrderTable";
import { ROUTES } from "../../model/routePaths";

export const SaleOrderDealerPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useSaleOrderOfDealer(0, 10);
  const { mutateAsync: completeOrder } = useSaleOrderComplete();
  const { mutateAsync: cancelOrder } = useSaleOrderDelete();

  const orders = data?.result?.data ?? [];

  const handleView = (id: string) =>
    navigate(`${ROUTES.DEALER_STAFF}/sale-orders/${id}`);

  const handleComplete = async (orderId: string) => {
    try {
      await completeOrder({ request: { orderId } }); // BE đang yêu cầu param query
      message.success("Hoàn tất đơn hàng thành công");
      refetch();
    } catch {
      message.error("Không thể hoàn tất đơn hàng");
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      message.success("Đã huỷ đơn hàng");
      refetch();
    } catch {
      message.error("Huỷ đơn hàng thất bại");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4">Danh sách đơn hàng của đại lý</h1>
      <SaleOrderTable
        data={orders}
        loading={isLoading}
        onView={handleView}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
};
