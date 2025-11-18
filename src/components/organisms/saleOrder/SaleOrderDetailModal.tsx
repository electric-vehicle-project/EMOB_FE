// src/components/organisms/saleOrder/SaleOrderDetailModal.tsx
import { Modal, Button, Divider, Spin } from "antd";
import { useMemo } from "react";
import {
  useSaleOrderById,
  useSaleOrderDelete,
  useSaleOrderCompleteDirect,
} from "../../../service/saleOrderService";
import { SaleOrderDetailInfo } from "./SaleOrderDetailInfo";
import { useCustomerById } from "../../../service/customerService";
import { useDealerByIdQuery } from "../../../service/dealerService";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type {
  SaleOrderResponse,
  SaleOrderItemResponse,
} from "../../../model/SaleOrder";
import { SaleOrderItemTable } from "./SaleOrderItemTable";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  orderId?: string;
  onClose: () => void;
}

export const SaleOrderDetailModal = ({ open, orderId, onClose }: Props) => {
  const role = useSelector((s: RootState) => s.user?.role ?? null);

  const {
    data: orderData,
    isLoading,
    refetch,
  } = useSaleOrderById(orderId ?? "", {
    enabled: !!orderId && open,
  });

  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();

  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderCompleteDirect();

  const rawOrder: SaleOrderResponse | null =
    (orderData?.result as SaleOrderResponse | undefined) ??
    (orderData?.data as SaleOrderResponse | undefined) ??
    null;

  const { data: customerData } = useCustomerById(rawOrder?.customerId ?? "", {
    enabled: !!rawOrder?.customerId && open,
  });

  const { data: dealerData } = useDealerByIdQuery(rawOrder?.dealerId ?? "", {
    enabled: !!rawOrder?.dealerId && open,
  });

  const customer = customerData?.result ?? null;
  const dealer = dealerData?.result ?? null;

  const isDealerStaff = role === "DEALER_STAFF";
  const isEvmStaff = role === "EVM_STAFF";

  const normalizedItems: SaleOrderItemResponse[] = useMemo(() => {
    if (!rawOrder?.items) return [];
    return rawOrder.items.map((item) => ({
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
    }));
  }, [rawOrder]);

  const hideItems = rawOrder?.status === "COMPLETED" && !!rawOrder.customerId;

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      await cancelOrder(orderId);
      toast.success("Đã hủy đơn hàng");
      refetch();
      onClose();
    } catch {
      toast.error("Không thể hủy đơn hàng");
    }
  };

  const handleComplete = async () => {
    if (!orderId) return;
    try {
      await completeOrder(orderId);
      toast.success("Đã hoàn tất đơn hàng");
      refetch();
      onClose();
    } catch {
      toast.error("Không thể hoàn tất đơn hàng");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
    >
      {isLoading || !rawOrder ? (
        <div className="flex justify-center items-center h-[250px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#627254]">
            Chi tiết đơn hàng
          </h2>

          <SaleOrderDetailInfo
            order={rawOrder}
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

          {(isDealerStaff || isEvmStaff) && rawOrder.status === "CREATED" && (
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
        </div>
      )}
    </Modal>
  );
};

export default SaleOrderDetailModal;
