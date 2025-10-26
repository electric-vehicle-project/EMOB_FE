import { Form, Input } from "antd";
import type { FormInstance } from "antd/es/form";
import type { IDealer } from "../../model/Dealer";

interface Props {
  form: FormInstance<IDealer>;
  onFinish: (values: IDealer) => void;
  isEdit?: boolean;
}

export const DealerForm = ({ form, onFinish }: Props) => (
  <Form layout="vertical" form={form} onFinish={onFinish}>
    <Form.Item
      name="name"
      label="Tên đại lý"
      rules={[{ required: true, message: "Vui lòng nhập tên đại lý" }]}
    >
      <Input placeholder="Nhập tên đại lý" allowClear />
    </Form.Item>

    <Form.Item
      name="contactInfo"
      label="Thông tin liên hệ"
      rules={[{ required: true, message: "Vui lòng nhập thông tin liên hệ" }]}
    >
      <Input placeholder="Nhập email hoặc số điện thoại" allowClear />
    </Form.Item>

    <Form.Item
      name="country"
      label="Quốc gia"
      rules={[{ required: true, message: "Vui lòng nhập quốc gia" }]}
    >
      <Input placeholder="Ví dụ: Việt Nam, USA, Japan..." allowClear />
    </Form.Item>

    <Form.Item name="address" label="Địa chỉ">
      <Input placeholder="Nhập địa chỉ đại lý (nếu có)" allowClear />
    </Form.Item>
  </Form>
);
