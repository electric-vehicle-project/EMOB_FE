import React from "react";
import { Modal, Form, Input, message } from "antd";
import { useChangePassword } from "../../../service/accountService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const changePassword = useChangePassword();

  const onFinish = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Xác nhận mật khẩu không khớp");
      return;
    }
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    message.success("Đổi mật khẩu thành công");
    onSuccess();
    form.resetFields();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} destroyOnClose centered title="Đổi mật khẩu">
      <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false} className="mt-2">
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Tối thiểu 6 ký tự" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50" onClick={onClose} type="button">
            Hủy
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#627254] hover:bg-[#525e46] text-white" onClick={() => form.submit()}>
            Đổi mật khẩu
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
