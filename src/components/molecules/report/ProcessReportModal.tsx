// EMOB-2025 - ProcessReportModal (UI synced with PromotionForm)
import { Modal, Form, Select, Input, Button, Row, Col } from "antd";
import { useState } from "react";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (status: string, solution?: string) => void;
}

export const ProcessReportModal = ({ open, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm();
  const [status, setStatus] = useState<string>("IN_PROGRESS");

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.status, values.solution);
      form.resetFields();
    } catch {
      /* validation failed */
    }
  };

  return (
    <Modal
      open={open}
      centered
      title={
        <span className="text-[#627254] text-lg font-semibold">
          Process Report
        </span>
      }
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{ status: "IN_PROGRESS" }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                options={[
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Resolved", value: "RESOLVED" },
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
                label="Solution"
                name="solution"
                rules={[
                  { required: true, message: "Please describe the solution" },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter resolution details..."
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            className="!bg-[#627254] hover:!bg-[#4f6f52]"
            onClick={handleOk}
          >
            Confirm
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
