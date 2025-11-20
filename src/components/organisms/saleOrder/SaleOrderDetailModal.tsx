import { Modal, Divider, Spin } from "antd";
import { useMemo } from "react";
import { useSaleOrderById } from "../../../service/saleOrderService";
import { SaleOrderDetailInfo } from "./SaleOrderDetailInfo";
import { useCustomerById } from "../../../service/customerService";
import { useDealerByIdQuery } from "../../../service/dealerService";
import type {
  SaleOrderResponse,
  SaleOrderItemResponse,
} from "../../../model/SaleOrder";
import { SaleOrderItemTable } from "./SaleOrderItemTable";

interface Props {
  open: boolean;
  orderId?: string;
  onClose: () => void;
  disableActions?: boolean;
}

export const SaleOrderDetailModal = ({ open, orderId, onClose }: Props) => {
  const { data: orderData, isLoading } = useSaleOrderById(orderId ?? "", {
    enabled: !!orderId && open,
  });

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

  const hideItems = rawOrder?.status === "COMPLETED" && !!rawOrder?.customerId;

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
        </div>
      )}
    </Modal>
  );
};

export default SaleOrderDetailModal;
