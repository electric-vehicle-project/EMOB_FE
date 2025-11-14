// src/components/organisms/account/AccountModal.tsx
import { Modal, Form } from "antd";
import { AccountForm } from "../../molecules/Account/AccountForm";
import type { AccountCreatePayload } from "../../molecules/Account/AccountForm";
import { Role } from "../../../model/Account";

interface Props {
  open: boolean;
  onClose: () => void;
  creatorRole: Role;
  creatingRole: Role | null;
  onSubmit: (values: AccountCreatePayload) => Promise<void>;
  loading?: boolean;
  dealerOptions?: { label: string; value: string }[];
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

  const handleSubmit = async (values: AccountCreatePayload) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      interface ApiError {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.message ?? "";

      if (msg.toLowerCase().includes("email")) {
        form.setFields([{ name: "email", errors: ["Email đã tồn tại"] }]);
        return;
      }

      if (msg.toLowerCase().includes("phone")) {
        form.setFields([
          { name: "phone", errors: ["Số điện thoại đã tồn tại"] },
        ]);
        return;
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
