import { Modal, Descriptions, Spin } from "antd";
import { useInstallmentPlanView } from "../../service/installmentPlanService";

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
  const { data, isLoading, isError } = useInstallmentPlanView(id!, {
    enabled: Boolean(id),
  });

  const detail = data?.result; // data response
  const statusMap: Record<string, string> = {
    PAID: "Đã thanh toán",
    NOT_PAID: "Chưa thanh toán",
    OVERDUE: "Quá hạn",
    CANCELLED: "Đã hủy",
  };
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
      ) : detail ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Ngày đặt cọc">
            {detail.downDate}
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền đặt cọc">
            {detail.deposit}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {detail.totalAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền trả hàng tháng">
            {detail.monthlyAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Lãi suất">
            {detail.interestRate}%
          </Descriptions.Item>
          <Descriptions.Item label="Kỳ hạn (tháng)">
            {detail.termMonths}
          </Descriptions.Item>
          <Descriptions.Item label="Đã trả">
            {detail.paidMonths}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày thanh toán tiếp theo">
            {detail.nextDueDate}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {statusMap[detail.status] || detail.status}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Không có dữ liệu</p>
      )}
    </Modal>
  );
};
