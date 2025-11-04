// src/components/molecules/report/ReportFormModal.tsx
// EMOB-2025 - ReportFormModal (chọn 1 khách hàng hiển thị tên, gửi id)

import { Modal, Form, Input, Select, Row, Col, Button } from "antd";
import { useCustomerList } from "../../../service/customerService";
import { mapCustomerOptions } from "../../../utils/mapToSelectOptions";
import type { IReport } from "../../../model/Report";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: IReport | null;
}

export const ReportFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}: Props) => {
  const [form] = Form.useForm();

  // 🧩 Lấy danh sách khách hàng từ service
  const { data: customers, isLoading } = useCustomerList(0, 100);

  // ✅ Trích đúng dữ liệu theo cấu trúc thực tế của BE
  // response.result.data → mapCustomerOptions xử lý tương thích
  const customerOptions = mapCustomerOptions(customers);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal
      open={open}
      centered
      title={
        <span className="text-[#627254] text-lg font-semibold">
          {initialValues ? "Chỉnh sửa Báo cáo" : "Thêm Báo cáo mới"}
        </span>
      }
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={initialValues || { type: "FEEDBACK" }}
      >
        {/* --- Dòng 1: Tiêu đề + Loại báo cáo --- */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề báo cáo" },
              ]}
            >
              <Input placeholder="Nhập tiêu đề báo cáo..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Loại báo cáo"
              name="type"
              rules={[
                { required: true, message: "Vui lòng chọn loại báo cáo" },
              ]}
            >
              <Select
                options={[
                  { label: "Phản hồi", value: "FEEDBACK" },
                  { label: "Khiếu nại", value: "COMPLAINT" },
                ]}
                placeholder="Chọn loại báo cáo"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* --- Dòng 2: Nội dung mô tả --- */}
        <Form.Item
          label="Nội dung chi tiết"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung báo cáo" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Mô tả chi tiết vấn đề hoặc phản hồi..."
            className="!resize-none !rounded-lg"
          />
        </Form.Item>

        {/* --- Dòng 3: Chọn khách hàng --- */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Khách hàng"
              name="customerId"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
            >
              <Select
                showSearch
                placeholder="Chọn khách hàng"
                optionFilterProp="label"
                loading={isLoading}
                options={customerOptions}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                // ✅ chỉ cho chọn 1 khách hàng
                mode={undefined}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        {/* --- Footer hành động --- */}
        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            className="!bg-[#627254] hover:!bg-[#4f6f52]"
            onClick={handleOk}
          >
            {initialValues ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
