import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ReportDeleteConfirm = ({ open, onCancel, onConfirm }: Props) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      okText="Delete"
      cancelText="Cancel"
      onOk={onConfirm}
      centered
      okButtonProps={{ danger: true }}
      title={
        <div className="flex items-center gap-2 text-red-500">
          <ExclamationCircleFilled />
          <span>Delete Report</span>
        </div>
      }
    >
      <p className="text-gray-700">
        Are you sure you want to delete this report? This action cannot be
        undone.
      </p>
    </Modal>
  );
};
