import { Modal, Descriptions, Spin } from "antd";
import { useInstallmetnPlanByCustomersByIdQuery } from "../../service/installmentPlanService";

interface InstallmentPlanDetailModalProps {
  id: string | null;
  open: boolean;
  onClose: () => void;
}

export const InstallmentPlanDetailModal = ({
  id,
  open,
  onClose,
}: InstallmentPlanDetailModalProps) => {
  const validId = id ?? undefined;

  const { data, isLoading, isError } = useInstallmetnPlanByCustomersByIdQuery(
    validId,
    {
      enabled: !!validId, // also safe
    }
  );

  return (
    <Modal
      title="Chi tiết kế hoạch trả góp"
      open={open}
      onCancel={onClose}
      footer={[
        <button
          key="close"
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Đóng
        </button>,
      ]}
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spin />
        </div>
      ) : isError ? (
        <p>Không thể tải thông tin kế hoạch trả góp.</p>
      ) : data ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Ngày đặt cọc">
            {data.downDate}
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền đặt cọc">
            {data.deposit}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {data.totalAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Lãi suất">
            {data.interestRate}%
          </Descriptions.Item>
          <Descriptions.Item label="Kỳ hạn (tháng)">
            {data.termMonths}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày thanh toán tiếp theo">
            {data.nextDueDate}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {data.status}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Không có dữ liệu</p>
      )}
    </Modal>
  );
};
