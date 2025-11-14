import { Modal, Form, Input, Select, Row, Col, Button } from "antd";
import { useCustomerList } from "../../../service/customerService";
import { mapCustomerOptions } from "../../../utils/mapToSelectOptions";
import type { IReport } from "../../../model/Report";

interface FormValues {
  title: string;
  description: string;
  type: IReport["type"];
  customerId: string;
  vinNumber?: string;
}

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  initialValues?: IReport | null;
}

export const ReportFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}: Props) => {
  const [form] = Form.useForm<FormValues>();
  const isEdit = Boolean(initialValues);

  // Hook lấy danh sách khách hàng
  const { data: customers, isLoading } = useCustomerList();
  const customerOptions = mapCustomerOptions(customers);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit) {
        delete (values as Partial<FormValues>).customerId;
        delete (values as Partial<FormValues>).vinNumber;
      }
      onSubmit(values);
      form.resetFields();
    } catch {
      // no-op
    }
  };

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      footer={null}
      onCancel={onCancel}
      title={
        <span className="text-[#627254] text-lg font-semibold">
          {isEdit ? "Chỉnh sửa Báo cáo" : "Thêm Báo cáo mới"}
        </span>
      }
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={
          isEdit
            ? initialValues!
            : {
                type: "FEEDBACK",
              }
        }
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề báo cáo..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Loại báo cáo"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại" }]}
            >
              <Select
                placeholder="Chọn loại báo cáo"
                options={[
                  { value: "FEEDBACK", label: "Phản hồi" },
                  { value: "COMPLAINT", label: "Khiếu nại" },
                  { value: "DAMAGE", label: "Hư hỏng" },
                  { value: "MAINTENANCE", label: "Bảo trì" },
                  { value: "PERFORMANCE", label: "Hiệu suất" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && (
          <Form.Item
            label="Số VIN"
            name="vinNumber"
            rules={[{ required: true, message: "Vui lòng nhập số VIN" }]}
          >
            <Input placeholder="Nhập số VIN (VD: MQI-2308D734)" />
          </Form.Item>
        )}

        <Form.Item
          label="Nội dung chi tiết"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết về vấn đề hoặc phản hồi..."
            className="!resize-none !rounded-lg"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Khách hàng"
              name="customerId"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
            >
              <Select
                showSearch
                loading={isLoading}
                placeholder="Chọn khách hàng"
                optionFilterProp="label"
                options={customerOptions}
                disabled={isEdit}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            className="!bg-[#627254] hover:!bg-[#4f6f52]"
            onClick={handleOk}
          >
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
