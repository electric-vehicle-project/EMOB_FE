import { Modal } from "antd";

interface Props {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  message: string;
  /** ✅ Nhãn nút xác nhận: "Tạm ngưng" | "Mở lại" | "Cấm vĩnh viễn" | "Xóa"... */
  okText?: string;
  /** ✅ Nếu true -> nút OK màu đỏ (danger). Mặc định false -> nút OK xanh lá theo theme dự án */
  danger?: boolean;
  /** (optional) tiêu đề; nếu không truyền sẽ chỉ hiển thị message */
  title?: string | null;
}

export const DeleteConfirm = ({
  open,
  onConfirm,
  onCancel,
  message,
  okText = "Xóa",
  danger = true,
  title = null,
}: Props) => (
  <Modal
    open={open}
    centered
    onOk={onConfirm}
    onCancel={onCancel}
    okText={okText}
    cancelText="Hủy"
    destroyOnHidden
    title={title ?? undefined}
    okButtonProps={{
      danger,
      className: danger
        ? "rounded-xl h-9"
        : "!bg-[#627254] hover:!bg-[#525e46] text-white rounded-xl h-9",
    }}
    cancelButtonProps={{ className: "rounded-xl h-9" }}
  >
    {message}
  </Modal>
);
