// src/components/organisms/account/AccountModal.tsx
import { Modal, Form } from "antd";
import { useEffect, useRef, useState } from "react";
import { AccountForm } from "../../molecules/Account/AccountForm";
import type { AccountCreatePayload } from "../../molecules/Account/AccountForm";
import { Role } from "../../../model/Account";
import { DeleteConfirm } from "../DeleteConfirm";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Lưu trạng thái form ban đầu khi mở modal
  const initialValuesRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setConfirmOpen(false);
      // Sau khi reset, trạng thái này là "ban đầu"
      initialValuesRef.current = form.getFieldsValue(true);
    }
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

  // Khi bấm X hoặc bấm ra ngoài
  const requestClose = () => {
    const currentValues = form.getFieldsValue(true);
    const initialValues = initialValuesRef.current;

    // Nếu chưa có initialValues (trường hợp edge) -> đóng luôn
    if (!initialValues) {
      onClose();
      return;
    }

    const isSame =
      JSON.stringify(currentValues) === JSON.stringify(initialValues);

    if (isSame) {
      // Form đang giống trạng thái ban đầu (kể cả khi đã nhập rồi xóa hết)
      onClose();
      return;
    }

    // Có khác so với ban đầu -> hỏi confirm
    setConfirmOpen(true);
  };

  const handleConfirmDiscard = () => {
    form.resetFields();
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={requestClose}
        footer={null}
        title="Tạo tài khoản mới"
        width={600}
        destroyOnClose
        maskClosable // bấm nền cũng gọi onCancel => requestClose
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

      <DeleteConfirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDiscard}
        title="Hủy tạo tài khoản?"
        message="Các thông tin đã nhập sẽ bị xoá. Bạn có chắc chắn muốn hủy?"
        okText="Hủy thay đổi"
        danger
      />
    </>
  );
};
