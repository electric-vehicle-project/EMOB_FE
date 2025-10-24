import React from "react";
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
    try {
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
          ? new Date(values.validUntil).getTime()
          : 0,
      };

      await createQuotation(payload);

      message.success("Tạo báo giá thành công!");
      form.resetFields();
      // cho nó đợi add vào ròi mới close
      if (onSuccess) {
        await onSuccess();
      }
      onClose?.();
    } catch (error: any) {
      console.error("Create quotation error:", error);
      message.error(
        error?.response?.data?.message ||
          "Tạo báo giá thất bại, vui lòng thử lại."
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
          placeholder="Nhập mã xe"
          rules={[{ required: true, message: "Vehicle ID là bắt buộc" }]}
        />

        <TextInput
          label="Promotion ID"
          name="promotionId"
          placeholder="Nhập mã khuyến mãi (nếu có)"
        />

        <SelectInput
          label="Trạng thái xe"
          name="vehicleStatus"
          placeholder="Chọn trạng thái xe"
          options={[
            { label: "NORMAL", value: "NORMAL" },
            { label: "SPECIAL", value: "SPECIAL" },
            { label: "TEST_DRIVE", value: "TEST_DRIVE" },
            { label: "RESERVED", value: "RESERVED" },
            { label: "OLD_STOCK", value: "OLD_STOCK" },
            { label: "SOLD", value: "SOLD" },
          ]}
          rules={[{ required: true, message: "Hãy chọn trạng thái xe" }]}
        />

        <TextInput
          label="Màu sắc"
          name="color"
          placeholder="Nhập màu xe"
          rules={[{ required: true, message: "Color là bắt buộc" }]}
        />

        <NumberInput
          label="Số lượng"
          name="quantity"
          min={1}
          placeholder="Nhập số lượng xe"
          rules={[{ required: true, message: "Quantity là bắt buộc" }]}
        />

        <TextInput
          label="Customer ID"
          name="customerId"
          placeholder="Nhập mã khách hàng"
          rules={[{ required: true, message: "Customer ID là bắt buộc" }]}
        />

        <NumberInput
          label="Valid Until (days)"
          name="validUntil"
          min={0}
          placeholder="Enter valid duration (days)"
          rules={[{ required: true, message: "Valid until is required" }]}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo báo giá
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateQuotationPage;
