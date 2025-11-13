import { useParams, useNavigate } from "react-router-dom";
import { Button, Divider, Spin } from "antd";
import {
  useSaleOrderById,
  useSaleOrderDelete,
  useSaleOrderCompleteDirect,
} from "../../service/saleOrderService";
import { SaleOrderDetailInfo } from "../../components/organisms/saleOrder/SaleOrderDetailInfo";
import { useCustomerById } from "../../service/customerService";
import { useDealerByIdQuery } from "../../service/dealerService";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { SaleOrderItemTable } from "../../components/organisms/saleOrder/SaleOrderItemTable";
import { CardWrapper } from "../../components/template/CardWrapper";
import type {
  SaleOrderResponse,
  SaleOrderItemResponse,
} from "../../model/SaleOrder";
import { toast } from "react-toastify";

export const SaleOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useSelector((s: RootState) => s.user?.role ?? null);

  const { data: orderData, isLoading, refetch } = useSaleOrderById(id ?? "");
  const { mutate: cancelOrder, isPending: canceling } = useSaleOrderDelete();
  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderCompleteDirect();

  const rawOrder: SaleOrderResponse | null =
    (orderData?.result as SaleOrderResponse | undefined) ??
    (orderData?.data as SaleOrderResponse | undefined) ??
    null;

  const { data: customerData } = useCustomerById(rawOrder?.customerId ?? "", {
    enabled: !!rawOrder?.customerId,
  });

  const { data: dealerData } = useDealerByIdQuery(rawOrder?.dealerId ?? "", {
    enabled: !!rawOrder?.dealerId,
  });

  const customer = customerData?.result ?? null;
  const dealer = dealerData?.result ?? null;

  if (isLoading || !rawOrder) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  const order: SaleOrderResponse = rawOrder;

  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";

  const handleCancel = () => {
    if (!id) return;
    cancelOrder(id, {
      onSuccess: () => {
        toast.success("Đã hủy đơn hàng");
        refetch();
      },
      onError: () => toast.error("Không thể hủy đơn hàng"),
    });
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      await completeOrder(id);
      refetch();
    } catch {
      toast.error("Không thể hoàn tất đơn hàng");
    }
  };

  const hideItems = order.status === "COMPLETED" && !!order.customerId;

  const normalizedItems: SaleOrderItemResponse[] = (order.items ?? []).map(
    (item) => ({
      id: item.id,
      vehicleId: item.vehicleId ?? "",
      vehicleName: "",
      vehicleUnitIds: item.vehicleUnitIds ?? [],
      vehicleStatus: item.vehicleStatus ?? "NORMAL",
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPrice: item.discountPrice ?? 0,
      totalPrice: item.totalPrice,
      promotionName: item.promotionName ?? "-",
    })
  );

  return (
    <div className="p-6 space-y-6">
      <CardWrapper>
        <div className="flex flex-col gap-3 mb-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-[#3f4a3c] text-white hover:!bg-[#2f382e] w-fit"
          >
            Quay lại
          </Button>

          <h2 className="text-xl font-semibold text-[#627254]">
            Chi tiết đơn hàng
          </h2>
        </div>

        <SaleOrderDetailInfo
          order={order}
          customer={customer}
          dealer={dealer}
        />

        {!hideItems && (
          <>
            <Divider />
            <h3 className="text-lg font-medium mb-2 text-[#3f4a3c]">
              Danh sách sản phẩm
            </h3>
            <SaleOrderItemTable items={normalizedItems} />
          </>
        )}

        {(isDealerStaff || isEvmStaff) && order.status === "CREATED" && (
          <div className="flex justify-end gap-3 mt-4">
            <Button
              danger
              loading={canceling}
              onClick={handleCancel}
              className="px-5 rounded-lg"
            >
              Hủy đơn hàng
            </Button>
            <Button
              type="primary"
              loading={completing}
              onClick={handleComplete}
              className="bg-[#3f4a3c] border-none hover:!bg-[#2f382e] px-6 rounded-lg"
            >
              Hoàn tất đơn hàng
            </Button>
          </div>
        )}
      </CardWrapper>
    </div>
  );
};

export default SaleOrderDetailPage;
