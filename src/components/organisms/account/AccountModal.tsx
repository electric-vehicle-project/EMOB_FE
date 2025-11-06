// src/components/organisms/account/AccountModal.tsx
import { Modal, message } from "antd";
import { useEffect } from "react";
import { useForm } from "antd/es/form/Form";
import { AccountForm } from "../../molecules/Account/AccountForm";
import type { AccountCreatePayload } from "../../molecules/Account/AccountForm";
import { Role } from "../../../model/Account";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AccountCreatePayload) => Promise<void> | void;
  creatorRole: Role;
  creatingRole: Role | null;
  loading?: boolean;
  /** Chỉ truyền khi Admin tạo Manager */
  dealerOptions?: { label: string; value: string }[];
}

export const AccountModal = ({
  open,
  onClose,
  onSubmit,
  creatorRole,
  creatingRole,
  loading = false,
  dealerOptions = [],
}: Props) => {
  const [form] = useForm();

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const handleFinish = async (values: AccountCreatePayload) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể lưu. Vui lòng thử lại."
      );
    }
  };

  return (
    <Modal
      open={open}
      title="Thêm tài khoản mới"
      onCancel={onClose}
      destroyOnClose
      centered
      footer={null} // ✅ bỏ nút OK/Cancel mặc định
    >
      <AccountForm
        form={form}
        onSubmit={handleFinish}
        loading={loading}
        role={creatorRole}
        defaultCreatingRole={creatingRole || undefined}
        dealerOptions={dealerOptions}
      />
    </Modal>
  );
};
