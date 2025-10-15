import { Form } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { useNavigate, Link } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import { useForgetPasswordMutation } from "../../service/authenticationService";

interface ForgetPasswordFormValues {
  email: string;
}

export const ForgetPasswordForm = () => {
  const navigate = useNavigate();

  const { mutate: forgetPasswordMutation, isPending } = useForgetPasswordMutation();
  const [form] = Form.useForm<ForgetPasswordFormValues>();

  const handleSendEmail = (values: ForgetPasswordFormValues) => {
    const { email } = values;

    forgetPasswordMutation(
      { email },
      {
        onSuccess: () => {
          navigate(`/auth/forget-password-otp`);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          console.error("Login failed:", error);
          form.setFields([
            {
              name: "email",
              errors: ["Email không tồn tại, vui lòng nhập lại."],
            },
          ]);
        },
      }
    );
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleSendEmail}
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
          className="h-13 !pl-5 !pr-5"
          placeholder="Nhập địa chỉ email"
        />
      </Form.Item>

      {/* --- Nút gửi OTP --- */}
      <Form.Item className="!pt-10">
        <ButtonPrimary
          className="!h-12 w-full"
          htmlType="submit"
          disabled={isPending}
        >
          {isPending ? "Đang xử lý..." : "Gửi OTP"}
        </ButtonPrimary>
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
