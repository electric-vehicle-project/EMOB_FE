import React from "react";
import { Modal, Form, Button, message } from "antd";
import SelectInput from "../../components/atoms/SelectInput";
import { useApproveVehicleRequest } from "../../service/vehicleRequestService";

const ApproveVehicleRequestModal = ({
  open,
  record,
  onClose,
  onSuccess,
}: any) => {
  const [form] = Form.useForm();
  const { mutateAsync: approveVehicleRequest, isPending } =
    useApproveVehicleRequest();

  const handleApprove = async (values: any) => {
    try {
      await approveVehicleRequest({
        id: record.id,
        paymentStatus: values.paymentStatus,
      });
      message.success("Vehicle request approved successfully!");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Failed to approve request"
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
      title="Duyệt yêu cầu xe"
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleApprove}
        initialValues={{ paymentStatus: "FULL" }}
      >
        <SelectInput
          label="Hình thức thanh toán"
          name="paymentStatus"
          options={[
            { label: "Thanh toán toàn bộ", value: "FULL" },
            { label: "Trả góp", value: "INSTALLMENT" },
          ]}
          rules={[
            { required: true, message: "Vui lòng chọn hình thức thanh toán" },
          ]}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Xác nhận duyệt
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ApproveVehicleRequestModal;
