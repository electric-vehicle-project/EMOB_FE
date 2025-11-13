import React, { useMemo } from "react";
import { Modal, Descriptions, Spin, Alert, Tag, Divider } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { IQuotationItem } from "../../model/Quotation";
import { useGetQuotationById } from "../../service/quotationService";
import { useCustomerList } from "../../service/customerService";
import { useGetVehicles } from "../../service/vehicleService";
import { usePromotionList } from "../../service/promotionService";
import { useDealerByIdQuery } from "../../service/dealerService";
import { useGetAccountById } from "../../service/accountService";
import { useCurrentUser } from "../../utils/getCurrentUser";

interface ViewQuotationModalProps {
  open?: boolean;
  quotationId?: string;
  onClose?: () => void;
}

/* Hiển thị tên người tạo */
const AccountName: React.FC<{ accountId: string }> = ({ accountId }) => {
  const { data, isLoading } = useGetAccountById(accountId);
  if (isLoading)
    return <span className="text-gray-400 italic">Đang tải...</span>;
  return <span>{data?.result?.fullName || "-"}</span>;
};

/* Hiển thị tên đại lý */
const DealerName: React.FC<{ dealerId: string }> = ({ dealerId }) => {
  const { data, isLoading } = useDealerByIdQuery(dealerId);
  if (isLoading)
    return <span className="text-gray-400 italic">Đang tải...</span>;
  return (
    <span className="font-medium text-[#627254]">
      {data?.result?.name || "-"}
    </span>
  );
};

/* Component chính */
const ViewQuotationDetailModal: React.FC<ViewQuotationModalProps> = ({
  open,
  quotationId,
  onClose,
}) => {
  const { data, isLoading, isError, error } = useGetQuotationById(quotationId, {
    enabled: !!quotationId && !!open,
    retry: false,
  });

  // bắt role
  const account = useCurrentUser();
  const role = account?.role;
  const quotation = data?.result;
  const is401Error = error?.response?.status === 401;

  const { data: customersData } = useCustomerList(0, 100);
  const { data: vehiclesData } = useGetVehicles(0, 100);
  const { data: promotionsData } = usePromotionList("", 0, 100);

  // Mapping nhanh
  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customersData?.result?.data?.forEach((c: any) => (map[c.id] = c.fullName));
    return map;
  }, [customersData]);

  const vehicleMap = useMemo(() => {
    const map: Record<string, string> = {};
    vehiclesData?.result?.data?.forEach(
      (v: any) => (map[v.id] = `${v.model} (${v.type})`)
    );
    return map;
  }, [vehiclesData]);

  const promotionMap = useMemo(() => {
    const map: Record<string, string> = {};
    promotionsData?.result?.data?.forEach(
      (p: any) =>
        (map[p.id] = `${p.name} - Giảm ${p.value.toLocaleString("vi-VN")} ₫`)
    );
    return map;
  }, [promotionsData]);

  // Trạng thái màu + icon
  const getStatusTag = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã duyệt
          </Tag>
        );
      case "PENDING":
        return (
          <Tag icon={<ClockCircleOutlined />} color="gold">
            Đang chờ
          </Tag>
        );
      default:
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={780}
      destroyOnClose
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[#627254]">
            Chi tiết báo giá
          </span>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-10"
          >
            <Spin tip="Đang tải dữ liệu..." />
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6"
          >
            {is401Error ? (
              <Alert
                type="warning"
                showIcon
                message="Không có quyền truy cập"
                description="Bạn không có quyền xem chi tiết báo giá này. Chỉ MANAGER hoặc DEALER_STAFF được phép truy cập."
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
          </motion.div>
        ) : quotation ? (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Hiệu ứng nền */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#627254]/10 to-transparent rounded-full blur-3xl -z-0" />

            {/* Thông tin chung */}
            <Descriptions
              bordered
              column={2}
              size="middle"
              className="rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white/80 relative z-10"
            >
              <Descriptions.Item label="Khách hàng">
                <span className="font-medium text-gray-700">
                  {customerMap[quotation.customerId] || "-"}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Đại lý">
                <DealerName dealerId={quotation.dealerId} />
              </Descriptions.Item>

              {role == "MANAGER" && (
                <Descriptions.Item label="Người tạo">
                  <AccountName accountId={quotation.accountId} />
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Số lượng">
                <span className="font-semibold text-[#627254]">
                  {quotation.totalQuantity ?? 0}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Tổng giá trị">
                <span className="font-semibold text-emerald-600">
                  {quotation.totalPrice != null
                    ? `${quotation.totalPrice.toLocaleString("vi-VN")} ₫`
                    : "-"}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {getStatusTag(quotation.status)}
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
            <Divider
              orientation="left"
              className="mt-6 text-lg font-semibold text-[#627254]"
            >
              Danh sách xe trong báo giá
            </Divider>

            {quotation.items?.length ? (
              quotation.items.map((item: IQuotationItem, idx: number) => (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Descriptions
                    bordered
                    column={2}
                    size="small"
                    className="mb-4 rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-white/90"
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
                      <span className="font-semibold text-emerald-600">
                        {item.totalPrice != null
                          ? `${item.totalPrice.toLocaleString("vi-VN")} ₫`
                          : "-"}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 italic mt-2">
                Không có xe nào trong báo giá.
              </p>
            )}
          </motion.div>
        ) : (
          <p className="text-gray-500 italic">
            Không tìm thấy dữ liệu báo giá.
          </p>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default ViewQuotationDetailModal;
