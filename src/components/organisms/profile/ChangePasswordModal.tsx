// src/components/organisms/profile/ChangePasswordModal.tsx
import React from "react";
import { Modal, Form, Input, message } from "antd";
import { AxiosError } from "axios";
import { useChangePassword } from "../../../service/accountService";
import { Button } from "../../atoms/Button"; // ⬅️ dùng atoms/Button

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const changePassword = useChangePassword();

  const onFinish = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      await changePassword.mutateAsync({
        newPassword: values.newPassword, // ✅ backend chỉ nhận newPassword
      });
      message.success("Đổi mật khẩu thành công");
      onSuccess();
      form.resetFields();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      message.error(
        error?.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng thử lại"
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      title="Đổi mật khẩu"
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        requiredMark={false}
        className="mt-2"
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu hiện tại"
            className="!rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Tối thiểu 6 ký tự" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            className="!rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            className="!rounded-xl"
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button type="default" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            loading={changePassword?.isPending}
            onClick={() => form.submit()}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
