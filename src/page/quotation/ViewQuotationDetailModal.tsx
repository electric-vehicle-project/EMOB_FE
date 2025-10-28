import React, { useMemo } from "react";
import { Modal, Descriptions, Spin, Alert, Tag, Divider } from "antd";
import type { IQuotationItem } from "../../model/Quotation";
import { useGetQuotationById } from "../../service/quotationService";
import { useCustomerList } from "../../service/customerService";
import { useGetVehicles } from "../../service/vehicleService";
import { usePromotionList } from "../../service/promotionService";

interface ViewQuotationModalProps {
  open?: boolean;
  quotationId?: string;
  onClose?: () => void;
}

const ViewQuotationDetailModal: React.FC<ViewQuotationModalProps> = ({
  open,
  quotationId,
  onClose,
}) => {
  /** Lấy dữ liệu báo giá theo ID */
  const { data, isLoading, isError, error } = useGetQuotationById(quotationId, {
    enabled: !!quotationId && !!open,
    retry: false,
  });
  const quotation = data?.result;
  const is401Error = error?.response?.status === 401;

  /** Lấy danh sách customers, vehicles, promotions */
  const { data: customersData } = useCustomerList(0, 100);
  const { data: vehiclesData } = useGetVehicles(0, 100);
  const { data: promotionsData } = usePromotionList("", 0, 100);

  /** 3Map dữ liệu thành dictionary để tra nhanh */
  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customersData?.result?.data?.forEach((c: any) => {
      map[c.id] = `${c.fullName}`;
    });
    return map;
  }, [customersData]);

  const vehicleMap = useMemo(() => {
    const map: Record<string, string> = {};
    vehiclesData?.result?.data?.forEach((v: any) => {
      map[v.id] = `${v.model} (${v.type})`;
    });
    return map;
  }, [vehiclesData]);

  const promotionMap = useMemo(() => {
    const map: Record<string, string> = {};
    promotionsData?.result?.data?.forEach((p: any) => {
      map[p.id] = `${p.name} - Giảm ${p.value.toLocaleString("vi-VN")} ₫`;
    });
    return map;
  }, [promotionsData]);

  /** Render modal */
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={750}
      destroyOnClose
      title={<span className="text-lg font-semibold">Chi tiết báo giá</span>}
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spin tip="Đang tải dữ liệu..." />
        </div>
      ) : isError ? (
        <div className="py-6">
          {is401Error ? (
            <Alert
              type="warning"
              showIcon
              message="Không có quyền truy cập"
              description={
                <>
                  <p className="mb-2">
                    Bạn không có quyền xem chi tiết báo giá này.
                  </p>
                  <p className="text-sm text-gray-600">
                    Chỉ <strong>MANAGER</strong> hoặc{" "}
                    <strong>DEALER_STAFF</strong> mới có thể xem chi tiết.
                  </p>
                </>
              }
            />
          ) : (
            <Alert
              type="error"
              showIcon
              message="Không thể tải dữ liệu"
              description={
                error?.response?.data?.message ||
                "Đã xảy ra lỗi khi tải chi tiết báo giá. Vui lòng thử lại."
              }
            />
          )}
        </div>
      ) : quotation ? (
        <>
          {/* Thông tin chung */}
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Khách hàng">
              {customerMap[quotation.customerId] || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Đại lý">
              {quotation.dealerId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {quotation.accountId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {quotation.totalQuantity ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giá trị">
              {quotation.totalPrice != null
                ? `${quotation.totalPrice.toLocaleString("vi-VN")} ₫`
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  quotation.status === "PENDING"
                    ? "gold"
                    : quotation.status === "APPROVED"
                    ? "green"
                    : "red"
                }
              >
                {quotation.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Hiệu lực (ngày)">
              {quotation.validUntil ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {quotation.createdAt
                ? new Date(quotation.createdAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
          </Descriptions>

          {/* Danh sách xe */}
          <Divider orientation="left" className="mt-6">
            Danh sách xe
          </Divider>

          {quotation.items?.length ? (
            quotation.items.map((item: IQuotationItem, idx: number) => (
              <Descriptions
                key={item.id || idx}
                bordered
                column={2}
                size="small"
                className="mb-4"
              >
                <Descriptions.Item label="Xe">
                  {vehicleMap[item.vehicleId || ""] || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Khuyến mãi">
                  {item.promotionId
                    ? promotionMap[item.promotionId] || "Đang cập nhật"
                    : "Không áp dụng"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái xe">
                  <Tag color="blue">{item.vehicleStatus}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Màu sắc">
                  {item.color}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {item.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Đơn giá">
                  {item.unitPrice != null
                    ? `${item.unitPrice.toLocaleString("vi-VN")} ₫`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Giá sau giảm">
                  {item.discountPrice != null
                    ? `${item.discountPrice.toLocaleString("vi-VN")} ₫`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Thành tiền">
                  {item.totalPrice != null
                    ? `${item.totalPrice.toLocaleString("vi-VN")} ₫`
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            ))
          ) : (
            <p className="text-gray-500 italic mt-2">
              Không có xe trong báo giá.
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500 italic">Không tìm thấy dữ liệu báo giá.</p>
      )}
    </Modal>
  );
};

export default ViewQuotationDetailModal;
