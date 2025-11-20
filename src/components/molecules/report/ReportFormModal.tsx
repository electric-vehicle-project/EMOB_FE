// src/components/molecules/report/ReportFormModal.tsx
import { Modal, Form, Input, Select, Row, Col, Button } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCustomerList } from "../../../service/customerService";
import { mapCustomerOptions } from "../../../utils/mapToSelectOptions";
import type { IReport } from "../../../model/Report";
import { DeleteConfirm } from "../../organisms/DeleteConfirm";

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

  const baselineRef = useRef<FormValues | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { data: customers, isLoading } = useCustomerList();
  const customerOptions = mapCustomerOptions(customers);

  const transformed = useMemo<FormValues | undefined>(() => {
    if (!initialValues) return undefined;

    return {
      title: initialValues.title,
      description: initialValues.description,
      type: initialValues.type,
      customerId: initialValues.customerId,
      vinNumber: undefined,
    };
  }, [initialValues]);

  useEffect(() => {
    if (!open) return;

    if (isEdit && transformed) {
      form.setFieldsValue(transformed);
    } else {
      form.resetFields();
      form.setFieldsValue({ type: "FEEDBACK" });
    }

    const id = setTimeout(() => {
      baselineRef.current = form.getFieldsValue();
    }, 0);

    return () => clearTimeout(id);
  }, [open, isEdit, transformed, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch {
      /* empty */
    }
  };

  const handleRequestClose = () => {
    const baseline = baselineRef.current ?? form.getFieldsValue();
    const current = form.getFieldsValue();

    const hasChanges = JSON.stringify(current) !== JSON.stringify(baseline);

    if (!hasChanges) {
      onCancel();
      return;
    }

    setConfirmVisible(true);
  };

  const handleConfirmDiscard = () => {
    setConfirmVisible(false);
    form.resetFields();
    onCancel();
  };

  const handleCancelDiscard = () => {
    setConfirmVisible(false);
  };

  return (
    <>
      <Modal
        open={open}
        centered
        destroyOnClose
        footer={null}
        onCancel={handleRequestClose}
        title={
          <span className="text-[#627254] text-lg font-semibold">
            {isEdit ? "Chỉnh sửa Báo cáo" : "Thêm Báo cáo mới"}
          </span>
        }
      >
        <Form layout="vertical" form={form}>
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
              placeholder="Nhập mô tả chi tiết..."
              className="!resize-none !rounded-lg"
            />
          </Form.Item>

          {!isEdit && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Khách hàng"
                  name="customerId"
                  rules={[
                    { required: true, message: "Vui lòng chọn khách hàng" },
                  ]}
                >
                  <Select
                    showSearch
                    loading={isLoading}
                    placeholder="Chọn khách hàng"
                    optionFilterProp="label"
                    options={customerOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleRequestClose}>Hủy</Button>
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

      <DeleteConfirm
        open={confirmVisible}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
        message="Các thay đổi sẽ không được lưu. Bạn có chắc chắn muốn hủy?"
        okText="Bỏ thay đổi"
        danger={false}
        title="Xác nhận hủy"
      />
    </>
  );
};
