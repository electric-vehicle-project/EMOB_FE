import React from "react";
import { Form, Input } from "antd";
import type { FormItemProps } from "antd";
import type { InputProps } from "antd/es/input";

interface TextInputProps extends InputProps {
  label: React.ReactNode;
  name: string;
  rules?: FormItemProps["rules"];
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  rules,
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules}>
      <Input {...rest} />
    </Form.Item>
  );
};

export default TextInput;
