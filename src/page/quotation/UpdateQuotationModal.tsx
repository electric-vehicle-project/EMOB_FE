import React, { useEffect, useState } from "react";
import { Form, Button, message, Modal } from "antd";
import axios from "axios";
import type { IQuotationItem } from "../../model/Quotation";
import TextInput from "../../components/atoms/TextInput";
import SelectInput from "../../components/atoms/SelectInput";
import NumberInput from "../../components/atoms/NumberInput";

export interface UpdateQuotationPayload {
  items: IQuotationItem[];
  customerId: string;
  validUntil: number;
}

export interface UpdateQuotationModalProps {
  open?: boolean;
  quotationId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const UpdateQuotationModal: React.FC<UpdateQuotationModalProps> = ({
  open,
  quotationId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quotationId) {
      fetchQuotation(quotationId);
    }
  }, [quotationId]);

  const fetchQuotation = async (id: string) => {
    try {
      const res = await axios.get(`/api/quotations/${id}`);
      const quotation = res.data.result;

      if (!quotation) {
        message.warning("Quotation not found");
        return;
      }

      const item = quotation.items?.[0] || {};

      form.setFieldsValue({
        itemId: item.id,
        vehicleId: item.vehicleId,
        promotionId: item.promotionId,
        vehicleStatus: item.vehicleStatus,
        color: item.color,
        quantity: item.quantity,
        customerId: quotation.customerId,
        validUntil: quotation.validUntil,
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to load quotation data.");
    }
  };

  const handleSubmit = async (values: any) => {
    const payload: UpdateQuotationPayload = {
      items: [
        {
          id: values.itemId,
          vehicleId: values.vehicleId,
          promotionId: values.promotionId,
          vehicleStatus: values.vehicleStatus,
          color: values.color,
          quantity: values.quantity,
        },
      ],
      customerId: values.customerId,
      validUntil: values.validUntil,
    };

    setLoading(true);
    try {
      await axios.put(`/api/quotations/${quotationId}`, payload);
      message.success("Quotation updated successfully!");
      form.resetFields();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      message.error("Failed to update quotation.");
    } finally {
      setLoading(false);
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
      title={<span className="text-lg font-semibold">Cập nhật báo giá</span>}
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Quotation
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateQuotationModal;
