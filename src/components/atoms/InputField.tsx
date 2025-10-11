import React from "react";
import { Input } from "antd";
import type { InputProps, PasswordProps } from "antd/es/input";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

// ✅ Kế thừa kiểu gốc từ Ant Design để tương thích tuyệt đối
type Props = (InputProps | PasswordProps) & {
  type?: "text" | "password" | "username";
  placeholder: string;
};

export const InputField: React.FC<Props> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  ...rest
}) => {
  return type === "password" ? (
    <Input.Password
      className="!h-12 w-full !p-4"
      prefix={<LockOutlined />}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...(rest as PasswordProps)} //ép kiểu về PasswordProps
    />
  ) : type === "username" ? (
    <Input
      className="!h-12 w-full !p-4"
      prefix={<UserOutlined/>}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...(rest as InputProps)} //ép kiểu về InputProps
    />
  ) : (
    <Input
      className="!h-12 w-full !p-4"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...(rest as InputProps)} //ép kiểu về InputProps
    />
  );
};
