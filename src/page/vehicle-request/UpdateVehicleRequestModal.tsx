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

  // 🧩 Đổ dữ liệu cũ vào form
  useEffect(() => {
    if (data?.result) {
      const req = data.result;
      form.setFieldsValue({
        items: req.items?.map((item: any) => ({
          id: item.id,
          vehicleId: item.vehicleId,
          vehicleStatus: item.vehicleStatus,
          color: item.color,
          quantity: item.quantity,
        })),
      });
    }
  }, [data, form]);

  // 🧩 Submit form
  const handleSubmit = async (values: any) => {
    const payload = {
      items: values.items.map((item: any) => ({
        id: item.id,
        vehicleId: item.vehicleId,
        vehicleStatus: item.vehicleStatus,
        color: item.color,
        quantity: item.quantity,
      })),
    };

    console.log("📦 Payload cập nhật:", payload);

    try {
      await updateVehicleRequest({ id: requestId, data: payload });
      message.success("Cập nhật yêu cầu thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      message.error("Không thể cập nhật yêu cầu.");
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
      width={800}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="space-y-3"
      >
        {/* ====== Form.List cho phép cập nhật nhiều dòng ====== */}
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded-md mb-3 bg-gray-50"
                >
                  <SelectInput
                    {...restField}
                    name={[name, "vehicleId"]}
                    label="Xe"
                    placeholder="Chọn xe"
                    options={vehicleOptions}
                    loading={loadingVehicles}
                    rules={[{ required: true, message: "Vui lòng chọn xe" }]}
                  />

                  <SelectInput
                    {...restField}
                    name={[name, "vehicleStatus"]}
                    label="Trạng thái xe"
                    placeholder="Chọn trạng thái"
                    options={[
                      { label: "NORMAL", value: "NORMAL" },
                      { label: "SPECIAL", value: "SPECIAL" },
                      { label: "OLD_STOCK", value: "OLD_STOCK" },
                      { label: "RESERVED", value: "RESERVED" },
                      { label: "TEST_DRIVE", value: "TEST_DRIVE" },
                    ]}
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái" },
                    ]}
                  />

                  <TextInput
                    {...restField}
                    name={[name, "color"]}
                    label="Màu sắc"
                    placeholder="Nhập màu xe"
                    rules={[{ required: true, message: "Vui lòng nhập màu" }]}
                  />

                  <NumberInput
                    {...restField}
                    name={[name, "quantity"]}
                    label="Số lượng"
                    min={1}
                    placeholder="Nhập số lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" },
                    ]}
                  />

                  <div className="flex items-end justify-end">
                    {fields.length > 1 && (
                      <Button
                        danger
                        onClick={() => remove(name)}
                        className="bg-red-500 text-white"
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Nút thêm dòng */}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                className="mt-2 border-[#627254] text-[#627254]"
              >
                + Thêm xe
              </Button>
            </>
          )}
        </Form.List>

        {/* ====== Hành động ====== */}
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
