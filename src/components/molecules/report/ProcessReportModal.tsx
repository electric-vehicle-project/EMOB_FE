import { Modal, Form, Select, Input, Button, Row, Col } from "antd";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (status: "IN_PROGRESS" | "RESOLVED", solution?: string) => void;
}

export const ProcessReportModal = ({ open, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm();
  const [status, setStatus] = useState<"IN_PROGRESS" | "RESOLVED">(
    "IN_PROGRESS"
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.status, values.solution);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
      setStatus("IN_PROGRESS");
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      onCancel={onCancel}
      footer={null}
      title={
        <span className="text-[#627254] text-lg font-semibold">
          Xử lý Báo cáo
        </span>
      }
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{ status: "IN_PROGRESS" }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select
                options={[
                  { label: "Đang xử lý", value: "IN_PROGRESS" },
                  { label: "Đã giải quyết", value: "RESOLVED" },
                ]}
                onChange={(v) => setStatus(v)}
              />
            </Form.Item>
          </Col>
        </Row>

        {status === "RESOLVED" && (
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label="Giải pháp"
                name="solution"
                rules={[
                  {
                    required: true,
                    message:
                      "Vui lòng nhập nội dung giải pháp khi chọn 'Đã giải quyết'",
                  },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập mô tả giải pháp cho báo cáo..."
                  className="!resize-none !rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            className="!bg-[#627254] hover:!bg-[#4f6f52]"
            onClick={handleOk}
          >
            Xác nhận
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
