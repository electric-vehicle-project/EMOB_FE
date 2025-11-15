// src/components/organisms/account/AccountModal.tsx
import { Modal, Form } from "antd";
import { AccountForm } from "../../molecules/Account/AccountForm";
import type { AccountCreatePayload } from "../../molecules/Account/AccountForm";
import { Role } from "../../../model/Account";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  creatorRole: Role;
  creatingRole: Role | null;
  onSubmit: (values: AccountCreatePayload) => Promise<void>;
  loading?: boolean;
  dealerOptions?: { label: string; value: string }[];
}

/* Typing lỗi BE – đưa ra ngoài để tránh recreate mỗi render */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const AccountModal = ({
  open,
  onClose,
  creatorRole,
  creatingRole,
  onSubmit,
  loading = false,
  dealerOptions = [],
}: Props) => {
  const [form] = Form.useForm();

  /* Reset form mỗi khi modal mở */
  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleSubmit = async (values: AccountCreatePayload) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.message;

      if (typeof msg === "string") {
        const normalized = msg.toLowerCase();

        if (normalized.includes("email")) {
          form.setFields([{ name: "email", errors: ["Email đã tồn tại"] }]);
          return;
        }

        if (normalized.includes("phone")) {
          form.setFields([
            { name: "phone", errors: ["Số điện thoại đã tồn tại"] },
          ]);
          return;
        }
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Tạo tài khoản mới"
      width={600}
      destroyOnClose
      maskClosable={false} // tránh mất dữ liệu khi click ra ngoài
    >
      <AccountForm
        role={creatorRole}
        defaultCreatingRole={creatingRole}
        onSubmit={handleSubmit}
        loading={loading}
        dealerOptions={dealerOptions}
        form={form}
      />
    </Modal>
  );
};
