import React, { useEffect } from "react";
import { Form, Button, Modal, message } from "antd";
import TextInput from "../../components/atoms/TextInput";
import NumberInput from "../../components/atoms/NumberInput";
import SelectInput from "../../components/atoms/SelectInput";
import {
  useGetVehicleRequestById,
  useUpdateVehicleRequest,
} from "../../service/vehicleRequestService";

interface UpdateVehicleRequestModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  onSuccess?: () => void;
}

const UpdateVehicleRequestModal: React.FC<UpdateVehicleRequestModalProps> = ({
  open,
  onClose,
  requestId,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { data, isLoading } = useGetVehicleRequestById(requestId);
  const { mutateAsync: updateVehicleRequest, isPending } =
    useUpdateVehicleRequest();

  useEffect(() => {
    if (data?.result) {
      const req = data.result;
      const item = req.items?.[0] || {};
      form.setFieldsValue({
        itemId: item.id,
        vehicleId: item.vehicleId,
        vehicleStatus: item.vehicleStatus,
        color: item.color,
        quantity: item.quantity,
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: any) => {
    const payload = {
      items: [
        {
          id: values.itemId,
          vehicleId: values.vehicleId,
          vehicleStatus: values.vehicleStatus,
          color: values.color,
          quantity: values.quantity,
        },
      ],
    };

    try {
      await updateVehicleRequest({ id: requestId, data: payload });
      message.success("Vehicle request updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      message.error("Failed to update vehicle request.");
    }
  };

  return (
    <Modal
      open={open}
      title="Cập nhật yêu cầu xe"
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={600}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="space-y-3"
      >
        <TextInput
          label="Vehicle ID"
          name="vehicleId"
          placeholder="Nhập ID xe"
          rules={[{ required: true, message: "Vehicle ID is required" }]}
        />

        <SelectInput
          label="Vehicle Status"
          name="vehicleStatus"
          placeholder="Chọn trạng thái xe"
          options={[
            { label: "NORMAL", value: "NORMAL" },
            { label: "SPECIAL", value: "SPECIAL" },
            { label: "OLD_STOCK", value: "OLD_STOCK" },
            { label: "RESERVED", value: "RESERVED" },
            { label: "TEST_DRIVE", value: "TEST_DRIVE" },
          ]}
          rules={[{ required: true, message: "Chọn trạng thái xe" }]}
        />

        <TextInput
          label="Màu xe"
          name="color"
          placeholder="Nhập màu xe"
          rules={[{ required: true, message: "Color is required" }]}
        />

        <NumberInput
          label="Số lượng"
          name="quantity"
          min={1}
          placeholder="Nhập số lượng"
          rules={[{ required: true, message: "Quantity is required" }]}
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Cập nhật
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateVehicleRequestModal;
