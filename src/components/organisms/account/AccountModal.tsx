import { Modal, Button, message } from "antd";
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
}

export const AccountModal = ({
  open,
  onClose,
  onSubmit,
  creatorRole,
  creatingRole,
  loading = false,
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

  const footer = (
    <div className="flex justify-center">
      <Button
        type="primary"
        className="px-6 py-2 rounded-md w-full sm:w-auto bg-evm-green hover:!bg-[#4f6f52]"
        loading={loading}
        onClick={() => form.submit()}
      >
        Tạo tài khoản
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      title="Thêm tài khoản mới"
      onCancel={onClose}
      footer={footer}
      destroyOnHidden // ✅ thay destroyOnClose
      centered
    >
      <AccountForm
        form={form}
        onSubmit={handleFinish}
        loading={loading}
        role={creatorRole}
        defaultCreatingRole={creatingRole}
      />
    </Modal>
  );
};
