import React from "react";
import { Modal, Form, Button, message } from "antd";
import SelectInput from "../../components/atoms/SelectInput";
import { useApproveQuotation } from "../../service/quotationService";
import type { CreateQuotationPayload } from "./CreateQuotationModal";

interface ApproveQuotationModalProps {
  open?: boolean;
  record?: CreateQuotationPayload | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

const ApproveQuotationModal: React.FC<ApproveQuotationModalProps> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { mutateAsync: approveQuotation, isPending } = useApproveQuotation();

  const handleApprove = async (values: any) => {
    if (!record) return;

    const payload = record.items?.map((item) => ({
      vehicleId: item.vehicleId,
      promotionId: item.promotionId,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      await approveQuotation({
        id: record.id,
        data: payload,
        paymentStatus: values.paymentStatus,
      });

      message.success("Quotation approved successfully!");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message || "Failed to approve quotation."
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
      width={500}
      title={<span className="text-lg font-semibold">Duyệt báo giá</span>}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleApprove}
        initialValues={{ paymentStatus: "FULL" }}
      >
        <SelectInput
          label="Chọn hình thức thanh toán"
          name="paymentStatus"
          options={[
            { label: "Full Payment", value: "FULL" },
            { label: "Partial Payment", value: "INSTALLMENT" },
          ]}
          rules={[
            { required: true, message: "Vui lòng chọn hình thức thanh toán" },
          ]}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="bg-green-700 hover:bg-green-800"
          >
            Xác nhận duyệt
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ApproveQuotationModal;
