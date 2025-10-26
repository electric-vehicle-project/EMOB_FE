import React from "react";
import { Form, Input, message } from "antd";
import { accountService } from "../../service/accountService";
import { Button } from "../../components/atoms/Button";
import { useNavigate } from "react-router-dom";
import { LockOutlined } from "@ant-design/icons";
import CardWrapper from "../../components/template/CardWrapper";

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Xác nhận mật khẩu không khớp");
      return;
    }
    await accountService.changePassword(
      values.currentPassword,
      values.newPassword
    );
    message.success("Đổi mật khẩu thành công");
    navigate("/dashboard/profile/info");
  };

  return (
    <CardWrapper title="" maxWidth="max-w-md" variant="profile">
      <div className="border-l-4 border-[#627254] pl-3 mb-4">
        <h1 className="text-2xl font-bold text-[#414d38]">Đổi mật khẩu</h1>
        <p className="text-gray-500 text-base">Cập nhật mật khẩu mới của bạn</p>
      </div>

      <div className="flex justify-center">
        <LockOutlined className="text-[var(--primary-color)] text-3xl mx-auto mb-3" />
      </div>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
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
        <div className="flex justify-end items-center mt-6 flex-wrap gap-3">
          <Button
            className="!bg-[#627254] hover:!bg-[#525e46] active:!bg-[#414d38] text-white rounded-xl transition-all duration-300 px-6 py-2"
            onClick={() => form.submit()}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </Form>
    </CardWrapper>
  );
};

export default ResetPasswordPage;
