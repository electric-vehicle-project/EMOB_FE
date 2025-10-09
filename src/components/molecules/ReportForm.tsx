import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import type { IReport } from "../../model/report";

interface Props {
  form: FormInstance<IReport>;
  onFinish: (values: IReport) => void;
}

export const ReportForm = ({ form, onFinish }: Props) => (
  <Form layout="vertical" form={form} onFinish={onFinish}>
    <Form.Item
      name={["reportBy", "name"]}
      label="Khách hàng"
      validateTrigger="onChange"
      rules={[
        { required: true, message: "Vui lòng nhập tên khách hàng" },
        { pattern: /^[\p{L}\s]+$/u, message: "Chỉ cho phép chữ và khoảng trắng" },
        { min: 2, message: "Ít nhất 2 ký tự" },
      ]}
    >
      <Input placeholder="Nhập tên khách hàng" />
    </Form.Item>

    <Form.Item
      name="title"
      label="Tiêu đề"
      validateTrigger="onChange"
      rules={[
        { required: true, message: "Vui lòng nhập tiêu đề" },
        { min: 4, message: "Ít nhất 4 ký tự" },
      ]}
    >
      <Input placeholder="Ví dụ: Lỗi treo màn hình" />
    </Form.Item>

    <Form.Item
      name="description"
      label="Nội dung phản hồi"
      validateTrigger="onChange"
      rules={[{ required: true, message: "Vui lòng nhập nội dung phản hồi" }]}
    >
      <Input.TextArea rows={4} placeholder="Mô tả chi tiết phản hồi..." />
    </Form.Item>

    <Form.Item
      name="reportType"
      label="Loại phản hồi"
      rules={[{ required: true, message: "Vui lòng chọn loại phản hồi" }]}
    >
      <Select placeholder="Chọn loại">
        <Select.Option value="Complaint">Khiếu nại</Select.Option>
        <Select.Option value="Suggestion">Đề xuất</Select.Option>
        <Select.Option value="SystemBug">Lỗi hệ thống</Select.Option>
        <Select.Option value="ServiceFeedback">Phản hồi dịch vụ</Select.Option>
      </Select>
    </Form.Item>

    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
      <Select>
        <Select.Option value="Pending">Chờ xử lý</Select.Option>
        <Select.Option value="InReview">Đang xem xét</Select.Option>
        <Select.Option value="Resolved">Đã xử lý</Select.Option>
        <Select.Option value="Rejected">Từ chối</Select.Option>
      </Select>
    </Form.Item>
  </Form>
);
