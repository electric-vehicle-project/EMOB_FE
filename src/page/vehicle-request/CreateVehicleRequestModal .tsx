import React, { useMemo } from "react";
import { Modal, Form, Button, message } from "antd";
import TextInput from "../../components/atoms/TextInput";
import NumberInput from "../../components/atoms/NumberInput";
import SelectInput from "../../components/atoms/SelectInput";
import { useCreateVehicleRequest } from "../../service/vehicleRequestService";
import { useGetVehicles } from "../../service/vehicleService";

/**
 * Modal tạo yêu cầu xe (hỗ trợ thêm nhiều xe trong 1 request)
 */
const CreateVehicleRequestModal = ({ open, onClose, onSuccess }: any) => {
  const [form] = Form.useForm();
  const { mutateAsync: createVehicleRequest, isPending } =
    useCreateVehicleRequest();

  // Lấy danh sách xe
  const { data: vehiclesData, isLoading: loadingVehicles } = useGetVehicles(
    0,
    100
  );
  const vehicleOptions = useMemo(() => {
    const vehicles = vehiclesData?.result?.data || [];
    return vehicles.map((v: any) => ({
      label: v.model,
      value: v.id,
    }));
  }, [vehiclesData]);

  // Submit form
  const handleSubmit = async (values: any) => {
    const payload = {
      items: values.items.map((item: any) => ({
        vehicleId: item.vehicleId,
        vehicleStatus: item.vehicleStatus,
        color: item.color,
        quantity: item.quantity,
      })),
    };

    try {
      await createVehicleRequest(payload);
      message.success("Tạo yêu cầu thành công!");
      onSuccess?.();
      form.resetFields();
      onClose?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể tạo yêu cầu");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width={800}
      title="Tạo yêu cầu xe mới"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* ====== Form.List cho phép thêm nhiều xe ====== */}
        <Form.List name="items" initialValue={[{}]}>
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
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
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
                      { label: "TEST_DRIVE", value: "TEST_DRIVE" },
                      { label: "RESERVED", value: "RESERVED" },
                      { label: "OLD_STOCK", value: "OLD_STOCK" },
                      { label: "SOLD", value: "SOLD" },
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
                    rules={[
                      { required: true, message: "Vui lòng nhập màu xe" },
                    ]}
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

              {/* Nút thêm xe mới */}
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

        {/* ====== Nút hành động ====== */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo yêu cầu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateVehicleRequestModal;
