import { Form, Input, InputNumber, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import type { ITestDrive } from "../../model/TestDrive";

interface Props {
  form: FormInstance<ITestDrive>;
  onFinish: (values: ITestDrive) => void;
}

export const TestDriveForm = ({ form, onFinish }: Props) => (
  <Form layout="vertical" form={form} onFinish={onFinish}>
    {/* KHÁCH HÀNG */}
    <Form.Item
      name="customer"
      label="Khách hàng"
      validateTrigger="onChange"
      rules={[
        { required: true, message: "Vui lòng nhập tên khách hàng" },
        {
          pattern: /^[\p{L}\s]+$/u, // chỉ cho phép chữ Unicode + khoảng trắng
          message: "Tên khách hàng chỉ được chứa chữ và khoảng trắng",
        },
        {
          min: 2,
          message: "Tên khách hàng phải có ít nhất 2 ký tự",
        },
      ]}
    >
      <Input placeholder="Nhập tên khách hàng" />
    </Form.Item>

    {/* XE */}
    <Form.Item
      name="car"
      label="Xe"
      validateTrigger="onChange"
      rules={[
        { required: true, message: "Vui lòng nhập tên xe" },
        {
          pattern: /^[a-zA-Z0-9\s]+$/,
          message: "Tên xe chỉ được chứa chữ cái, số và khoảng trắng",
        },
        {
          min: 2,
          message: "Tên xe phải có ít nhất 2 ký tự",
        },
      ]}
    >
      <Input placeholder="Nhập tên xe (vd: Toyota Vios)" />
    </Form.Item>

    {/* NGÀY */}
    <Form.Item
      name="date"
      label="Ngày"
      validateTrigger="onChange"
      rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
    >
      <Input type="date" />
    </Form.Item>

    {/* THỜI LƯỢNG */}
    <Form.Item
      name="duration"
      label="Thời lượng (phút)"
      validateTrigger="onChange"
      rules={[
        {
          validator: (_, value) => {
            if (value === undefined || value === null || value === "") {
              return Promise.reject("Vui lòng nhập thời lượng lái thử");
            }
            if (typeof value !== "number" || isNaN(value)) {
              return Promise.reject("Vui lòng chỉ nhập số phút");
            }
            if (value < 5 || value > 30) {
              return Promise.reject("Thời lượng phải từ 5 đến 30 phút");
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <InputNumber
        className="w-full text-center"
        placeholder="Nhập số phút (5 - 30)"
        addonAfter="phút"
      />
    </Form.Item>

    {/* TRẠNG THÁI */}
    <Form.Item
      name="status"
      label="Trạng thái"
      validateTrigger="onChange"
      rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
    >
      <Select>
        <Select.Option value="Pending">Pending</Select.Option>
        <Select.Option value="Completed">Completed</Select.Option>
        <Select.Option value="Cancelled">Cancelled</Select.Option>
      </Select>
    </Form.Item>
  </Form>
);
