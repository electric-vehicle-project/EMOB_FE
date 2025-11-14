import { Modal } from "antd";
import { useEffect } from "react";
import { useForm } from "antd/es/form/Form";
import {
  AccountForm,
  type AccountCreatePayload,
} from "../../molecules/Account/AccountForm";
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

  return (
    <Modal
      open={open}
      title="Thêm tài khoản mới"
      onCancel={onClose}
      destroyOnClose
      centered
      footer={null}
    >
      <AccountForm
        form={form}
        onSubmit={onSubmit}
        loading={loading}
        role={creatorRole}
        defaultCreatingRole={creatingRole || undefined}
        dealerOptions={dealerOptions}
      />
    </Modal>
  );
};
