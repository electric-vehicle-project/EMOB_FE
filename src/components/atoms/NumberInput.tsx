import React from "react";
import { Form, InputNumber } from "antd";
import type { FormItemProps } from "antd";
import type { InputNumberProps } from "antd/es/input-number";

interface NumberInputProps extends InputNumberProps {
  label: React.ReactNode;
  name: string;
  rules?: FormItemProps["rules"];
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  name,
  rules,
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules}>
      <InputNumber {...rest} className="w-full" />
    </Form.Item>
  );
};

export default NumberInput;
