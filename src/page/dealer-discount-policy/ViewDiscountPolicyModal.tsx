import React, { useMemo } from "react";
import { Modal, Descriptions, Tag, Spin } from "antd";
import dayjs from "dayjs";
import {
  useGetAllDealers,
  useGetDiscountPolicyById,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";

interface ViewDealerDiscountPolicyModalProps {
  open: boolean;
  policyId: string;
  onClose: () => void;
}

const ViewDiscountPolicyModal: React.FC<ViewDealerDiscountPolicyModalProps> = ({
  open,
  policyId,
  onClose,
}) => {
  const { data, isLoading } = useGetDiscountPolicyById(policyId, {
    enabled: !!policyId && open,
  });

  const { data: allDealers } = useGetAllDealers(0, 200);
  const { data: allVehicles } = useGetVehicles(0, 200);

  const dealerMap = useMemo(() => {
    const map = new Map();
    allDealers?.result?.data?.forEach((d: any) =>
      map.set(d.id, d.name || d.dealerName || "Không rõ đại lý")
    );
    return map;
  }, [allDealers]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    allVehicles?.result?.data?.forEach((v: any) =>
      map.set(v.id, `${v.model || "Không rõ"} (${v.type || "N/A"})`)
    );
    return map;
  }, [allVehicles]);

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      UPCOMING: { color: "orange", text: "Sắp diễn ra" },
      ACTIVE: { color: "green", text: "Đang hoạt động" },
      EXPIRED: { color: "red", text: "Hết hạn" },
      INACTIVE: { color: "brown", text: "Ngừng hiệu lực" },
    };
    const s = config[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const policy = data?.result;

  return (
    <Modal
      open={open}
      title="Chi tiết Chính sách Chiết khấu"
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin tip="Đang tải dữ liệu..." />
        </div>
      ) : policy ? (
        <Descriptions
          bordered
          column={1}
          size="middle"
          labelStyle={{ width: 200, fontWeight: 600 }}
        >
          <Descriptions.Item label="Đại lý">
            {dealerMap.get(policy.dealerId) || policy.dealerId}
          </Descriptions.Item>

          <Descriptions.Item label="Xe">
            {vehicleMap.get(policy.vehicleId) || policy.vehicleId}
          </Descriptions.Item>

          <Descriptions.Item label="Giá cuối cùng">
            <strong className="text-green-600">
              {policy.finalPrice
                ? `${policy.finalPrice.toLocaleString("vi-VN")} ₫`
                : "—"}
            </strong>
          </Descriptions.Item>

          <Descriptions.Item label="Hệ số chiết khấu">
            {policy.customMultiplier?.toFixed(2)}
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian hiệu lực">
            {dayjs(policy.effectiveDate).format("DD/MM/YYYY")} →{" "}
            {dayjs(policy.expiryDate).format("DD/MM/YYYY")}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            {getStatusTag(policy.status)}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {policy.createAt
              ? dayjs(policy.createAt).format("DD/MM/YYYY HH:mm")
              : "—"}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p className="text-center text-gray-500 py-6">
          Không tìm thấy thông tin chính sách.
        </p>
      )}
    </Modal>
  );
};

export default ViewDiscountPolicyModal;
