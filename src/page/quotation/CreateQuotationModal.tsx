import React, { useState } from "react";
import { Form, Button, DatePicker, message, Modal } from "antd";
import type { IQuotationItem } from "../../model/Quotation";
import TextInput from "../../components/atoms/TextInput";
import SelectInput from "../../components/atoms/SelectInput";
import NumberInput from "../../components/atoms/NumberInput";
import { useCreateQuotation } from "../../service/quotationService";

export interface CreateQuotationPayload {
  items: IQuotationItem[];
  customerId: string;
  validUntil: number;
}

export interface CreateQuotationPageProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const CreateQuotationPage: React.FC<CreateQuotationPageProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { mutateAsync: createQuotation, isPending } = useCreateQuotation();

  const handleSubmit = async (values: any) => {
    const payload: CreateQuotationPayload = {
      items: [
        {
          vehicleId: values.vehicleId,
          promotionId: values.promotionId,
          vehicleStatus: values.vehicleStatus,
          color: values.color,
          quantity: values.quantity,
        },
      ],
      customerId: values.customerId,
      validUntil: values.validUntil
        ? values.validUntil.valueOf() // convert sang int timestamp
        : 0,
    };

    try {
      await createQuotation(payload); // Gọi mutation hook
      message.success("Quotation created successfully!");
      form.resetFields();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message || "Failed to create quotation."
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width={600}
      title={<span className="text-lg font-semibold">Tạo báo giá mới</span>}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="max-w-2xl"
      >
        <TextInput
          label="Vehicle ID"
          name="vehicleId"
          placeholder="Enter vehicle ID"
          rules={[{ required: true, message: "Vehicle ID is required" }]}
        />

        <TextInput
          label="Promotion ID"
          name="promotionId"
          placeholder="Enter promotion ID"
          rules={[{ required: true, message: "Promotion ID is required" }]}
        />

        <SelectInput
          label="Vehicle Status"
          name="vehicleStatus"
          placeholder="Select vehicle status"
          options={[
            { label: "NORMAL", value: "NORMAL" },
            { label: "SPECIAL", value: "SPECIAL" },
            { label: "TEST_DRIVE", value: "TEST_DRIVE" },
            { label: "RESERVED", value: "RESERVED" },
            { label: "OLD_STOCK", value: "OLD_STOCK" },
            { label: "SOLD", value: "SOLD" },
          ]}
          rules={[{ required: true, message: "Select vehicle status" }]}
        />

        <TextInput
          label="Color"
          name="color"
          placeholder="Enter vehicle color"
          rules={[{ required: true, message: "Color is required" }]}
        />

        <NumberInput
          label="Quantity"
          name="quantity"
          min={1}
          placeholder="Enter quantity"
          rules={[{ required: true, message: "Quantity is required" }]}
        />

        <TextInput
          label="Customer ID"
          name="customerId"
          placeholder="Enter customer ID"
          rules={[{ required: true, message: "Customer ID is required" }]}
        />

        <NumberInput
          label="Valid Until (days)"
          name="validUntil"
          min={0}
          placeholder="Enter valid duration (days)"
          rules={[{ required: true, message: "Valid until is required" }]}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create Quotation
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateQuotationPage;
