import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate, Link } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";

interface FormValues {
  email: string;
}

export const ForgetPasswordForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  // --- Hàm xử lý gửi OTP ---
  const handleSendOTP = (values: FormValues) => {
    const { email } = values;
    navigate("/auth/forget-password-otp", { state: { email } });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleSendOTP}
      className="space-y-10"
    >
      {/* --- Trường nhập email --- */}
      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Email không được để trống" },
          {
            type: "email",
            message: "Định dạng email không hợp lệ",
          },
        ]}
      >
        <InputField
          prefix={
            <MailOutlined
              style={{
                color: "#627254",
                fontSize: 19,
              }}
            />
          }
          className="h-13"
          placeholder="Nhập địa chỉ email"
        />
      </Form.Item>

      {/* --- Nút gửi OTP --- */}
      <Form.Item className="!pt-5">
        <Link to="/auth/forget-password-otp">
          <ButtonPrimary className="!h-12 w-full">Gửi OTP</ButtonPrimary>
        </Link>
      </Form.Item>

      {/* --- Liên kết trở về đăng nhập --- */}
      <div className="flex justify-center">
        <Link to="/auth/login">
          <p className="text-sm text-[#627254] hover:underline">Đăng nhập</p>
        </Link>
      </div>
    </Form>
  );
};
