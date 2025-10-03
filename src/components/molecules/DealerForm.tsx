// DealerForm.tsx
import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import type { IDealer } from "../../model/Dealer";

interface Props {
  form: FormInstance<IDealer>;
  onFinish: (values: IDealer) => void;
  isEdit?: boolean;
}

export const DealerForm = ({ form, onFinish, isEdit }: Props) => (
  <Form
    layout="vertical"
    form={form}
    onFinish={onFinish}
    initialValues={{
      status: isEdit ? undefined : "Active", // mặc định Active khi thêm
    }}
  >
    <Form.Item
      name="name"
      label="Tên đại lý"
      rules={[{ required: true, message: "Vui lòng nhập tên đại lý" }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="email"
      label="E-mail"
      rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="phone"
      label="Số điện thoại"
      rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="address"
      label="Địa chỉ"
      rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="status"
      label="Trạng thái"
      rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
    >
      <Select>
        <Select.Option value="Active">Active</Select.Option>
        <Select.Option value="Inactive">Inactive</Select.Option>
      </Select>
    </Form.Item>
  </Form>
);
