import React, { useEffect } from "react";
import { Form, Button, message, Modal } from "antd";
import type { IQuotationItem } from "../../model/Quotation";
import TextInput from "../../components/atoms/TextInput";
import SelectInput from "../../components/atoms/SelectInput";
import NumberInput from "../../components/atoms/NumberInput";
import {
  useGetQuotationById,
  useUpdateQuotation,
} from "../../service/quotationService";

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

  /** 🔹 Hook lấy chi tiết báo giá */
  const {
    data: quotationData,
    isLoading: isFetching,
    refetch,
  } = useGetQuotationById(quotationId!, {
    enabled: !!quotationId && open, // chỉ fetch khi mở modal
  });

  /** 🔹 Hook cập nhật báo giá */
  const { mutateAsync: updateQuotation, isPending } = useUpdateQuotation();

  /** 🔹 Khi dữ liệu có, fill vào form */
  useEffect(() => {
    if (quotationData?.result) {
      const quotation = quotationData.result;
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
    }
  }, [quotationData, form]);

  /** 🔹 Submit form */
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

    try {
      await updateQuotation({ id: quotationId, data: payload });
      message.success("Cập nhật báo giá thành công!");
      form.resetFields();
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Update quotation error:", error);
      message.error(
        error?.response?.data?.message || "Cập nhật báo giá thất bại."
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
          placeholder="Nhập mã xe"
          rules={[{ required: true, message: "Vehicle ID là bắt buộc" }]}
        />

        <TextInput
          label="Promotion ID"
          name="promotionId"
          placeholder="Nhập mã khuyến mãi"
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
          rules={[{ required: true, message: "Chọn trạng thái xe" }]}
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
          placeholder="Nhập số lượng"
          rules={[{ required: true, message: "Quantity là bắt buộc" }]}
        />

        <TextInput
          label="Customer ID"
          name="customerId"
          placeholder="Nhập mã khách hàng"
          rules={[{ required: true, message: "Customer ID là bắt buộc" }]}
        />

        <NumberInput
          label="Valid Until (ngày)"
          name="validUntil"
          min={0}
          placeholder="Nhập số ngày hiệu lực"
          rules={[{ required: true, message: "Valid Until là bắt buộc" }]}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending || isFetching}
          >
            Cập nhật
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateQuotationModal;
