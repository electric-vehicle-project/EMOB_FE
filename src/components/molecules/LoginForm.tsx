import { Checkbox, Form, message } from "antd";
import { InputField } from "../atoms/InputField";
import { ButtonPrimary } from "../atoms/ButtonPrimary";
import { ButtonGoogle } from "../atoms/ButtonGoogle";
import { useNavigate, Link } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useLoginMutation } from "../../service/authenticationService";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../../redux/features/userSlice";

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: loginMutation, isPending } = useLoginMutation();
  const [form] = Form.useForm<LoginFormValues>();

  const handleLogin = (values: LoginFormValues) => {
    const { username, password } = values;

    loginMutation(
      { email: username, password },
      {
        onSuccess: (res) => {
          //lưu token & refreshToken
          localStorage.setItem("token", res.data.result.token);
          localStorage.setItem("refreshToken", res.data.result.refreshToken);

          //lưu thông tin user vào Redux store
          dispatch(loginAction(res));

          //thông báo & điều hướng
          message.success("Đăng nhập thành công!");
          navigate(`/${res.data.result.role}`);
        },
        onError: (error: any) => {
          console.error("Login failed:", error);
          form.setFields([
            {
              name: "username",
              errors: ["Tên đăng nhập hoặc mật khẩu không đúng"],
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
      onFinish={handleLogin}
      className="space-y-5"
    >
      {/* --- Username Field --- */}
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
      >
        <InputField
          prefix={<UserOutlined style={{ color: "#627254", fontSize: 19 }} />}
          className="h-13 !pl-5 !pr-5 "
          type="text"
          placeholder="Tên đăng nhập"
        />
      </Form.Item>

      {/* --- Password Field --- */}
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
      >
        <InputField
          className="h-13 !pl-5 !pr-5"
          prefix={<LockOutlined style={{ color: "#627254", fontSize: 19 }} />}
          type="password"
          placeholder="Mật khẩu"
        />
      </Form.Item>

      {/* --- Ghi nhớ & Quên mật khẩu --- */}
      <div className="flex justify-between items-center px-5">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox className="!text-[var(--primary-color)]">
            Ghi nhớ mật khẩu
          </Checkbox>
        </Form.Item>

        <Link to="/auth/forget-password">
          <p className="text-sm text-[var(--primary-color)] hover:underline">
            Quên mật khẩu?
          </p>
        </Link>
      </div>

      {/* --- Nút đăng nhập --- */}
      <Form.Item>
        <ButtonPrimary
          className="!h-12 w-full"
          htmlType="submit"
          disabled={isPending}
        >
          {isPending ? "Đang xử lý..." : "Đăng nhập"}
        </ButtonPrimary>
      </Form.Item>

      {/* --- Đăng nhập bằng Google --- */}
      <Form.Item>
        <ButtonGoogle />
      </Form.Item>
    </Form>
  );
};
