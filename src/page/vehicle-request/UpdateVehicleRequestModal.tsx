import React, { useEffect, useMemo } from "react";
import { Form, Button, Modal, message } from "antd";
import TextInput from "../../components/atoms/TextInput";
import NumberInput from "../../components/atoms/NumberInput";
import SelectInput from "../../components/atoms/SelectInput";
import {
  useGetVehicleRequestById,
  useUpdateVehicleRequest,
} from "../../service/vehicleRequestService";
import { useGetVehicles } from "../../service/vehicleService";
import type { IVehicle } from "../../model/Vehicle";
import { toast } from "react-toastify";

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
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles(
    0,
    100
  );
  const vehicleOptions = useMemo(() => {
    const vehicles = vehiclesData?.result?.data || [];
    return vehicles.map((v: IVehicle) => ({
      label: `${v.model} (${v.type})`,
      value: v.id,
    }));
  }, [vehiclesData]);
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
      toast.success("Vehicle request updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to update vehicle request.");
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
        <SelectInput
          label="Xe"
          name="vehicleId"
          placeholder="Chọn xe"
          options={vehicleOptions}
          loading={loadingVehicles}
          rules={[{ required: true, message: "Vui lòng chọn xe" }]}
        />

        <SelectInput
          label="Trạng thái xe"
          name="vehicleStatus"
          placeholder="Chọn trạng thái xe"
          options={[
            { label: "Bình thường", value: "NORMAL" },
            { label: "Đặc biệt", value: "SPECIAL" },
            { label: "Hàng tồn cũ", value: "OLD_STOCK" },
            { label: "Đã đặt trước", value: "RESERVED" },
            { label: "Xe lái thử", value: "TEST_DRIVE" },
          ]}
          rules={[{ required: true, message: "Vui lòng chọn trạng thái xe" }]}
        />

        <TextInput
          label="Màu xe"
          name="color"
          placeholder="Nhập màu xe"
          rules={[{ required: true, message: "Vui lòng nhập màu xe" }]}
        />

        <NumberInput
          label="Số lượng"
          name="quantity"
          min={1}
          placeholder="Nhập số lượng"
          rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
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
