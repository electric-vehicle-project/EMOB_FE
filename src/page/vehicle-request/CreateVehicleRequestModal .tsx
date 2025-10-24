import React from "react";
import { Modal, Form, Button, message } from "antd";
import TextInput from "../../components/atoms/TextInput";
import NumberInput from "../../components/atoms/NumberInput";
import SelectInput from "../../components/atoms/SelectInput";
import { useCreateVehicleRequest } from "../../service/vehicleRequestService";

const CreateVehicleRequestModal = ({ open, onClose, onSuccess }: any) => {
  const [form] = Form.useForm();
  const { mutateAsync: createVehicleRequest, isPending } =
    useCreateVehicleRequest();

  const handleSubmit = async (values: any) => {
    const payload = {
      items: [
        {
          vehicleId: values.vehicleId,
          vehicleStatus: values.vehicleStatus,
          color: values.color,
          quantity: values.quantity,
        },
      ],
    };
    try {
      await createVehicleRequest(payload);
      message.success("Tạo yêu cầu thành công!");
      onSuccess?.();
      onClose?.();
      form.resetFields();
    } catch (err: any) {
      message.error("Không thể tạo yêu cầu");
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
      title="Tạo yêu cầu xe mới"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <TextInput
          label="Vehicle ID"
          name="vehicleId"
          placeholder="Nhập Vehicle ID"
          rules={[{ required: true }]}
        />
        <SelectInput
          label="Trạng thái xe"
          name="vehicleStatus"
          placeholder="Chọn trạng thái"
          options={[
            { label: "NORMAL", value: "NORMAL" },
            { label: "SPECIAL", value: "SPECIAL" },
            { label: "TEST_DRIVE", value: "TEST_DRIVE" },
            { label: "RESERVED", value: "RESERVED" },
            { label: "OLD_STOCK", value: "OLD_STOCK" },
            { label: "SOLD", value: "SOLD" },
          ]}
          rules={[{ required: true }]}
        />
        <TextInput
          label="Màu sắc"
          name="color"
          placeholder="Nhập màu xe"
          rules={[{ required: true }]}
        />
        <NumberInput
          label="Số lượng"
          name="quantity"
          min={1}
          placeholder="Nhập số lượng"
          rules={[{ required: true }]}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo mới
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateVehicleRequestModal;
