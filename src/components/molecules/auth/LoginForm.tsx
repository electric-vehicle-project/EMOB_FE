import { Checkbox, Form } from "antd";
import { InputField } from "../../atoms/InputField";
import { ButtonPrimary } from "../../atoms/ButtonPrimary";
import { ButtonGoogle } from "../../atoms/ButtonGoogle";
import { useNavigate, Link } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useLoginMutation } from "../../../service/authenticationService";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/features/userSlice";
import { toast } from "react-toastify";

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
          const { token, refreshToken, ...user } = res.data.result;
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);

          //lưu thông tin user vào Redux store
          dispatch(login(user));

          //thông báo & điều hướng
          toast.success("Đăng nhập thành công!");
          navigate(`/${user.role.toLowerCase()}`);

        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          console.error("Login failed:", error);
          form.setFields([
            {
              name: "username",
              errors: [""],
            },
            {
              name: "password",
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
        <ButtonGoogle/>
      </Form.Item>
    </Form>
  );
};
