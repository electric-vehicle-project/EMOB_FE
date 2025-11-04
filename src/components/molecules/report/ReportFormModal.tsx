// EMOB-2025 - ReportFormModal (UI synced with PromotionForm)
import { Modal, Form, Input, Select, Row, Col, Button } from "antd";
import type { IReport } from "../../../model/report";

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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
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
          {initialValues ? "Edit Report" : "Create New Report"}
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
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please enter the title" }]}
            >
              <Input placeholder="Report title" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select report type" }]}
            >
              <Select
                options={[
                  { label: "Feedback", value: "FEEDBACK" },
                  { label: "Complaint", value: "COMPLAINT" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Describe the issue or feedback..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Customer ID"
              name="customerId"
              rules={[{ required: true, message: "Please enter Customer ID" }]}
            >
              <Input placeholder="UUID of customer" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            className="!bg-[#627254] hover:!bg-[#4f6f52]"
            onClick={handleOk}
          >
            {initialValues ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
