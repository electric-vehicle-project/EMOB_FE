// src/components/organisms/vehicle/VehiclePriceUpdateModal.tsx
import { useEffect, useState } from "react";
import { Modal, Form, InputNumber, Tag, Divider } from "antd";
import { DollarOutlined, CarOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useUpdateVehiclePrices } from "../../../service/vehicleService";
import type { IVehicle } from "../../../model/Vehicle";
import { Button } from "../../atoms/Button";
import { DeleteConfirm } from "../DeleteConfirm";

const formatCurrency = (v?: number | null) =>
  typeof v === "number" ? `${v.toLocaleString("vi-VN")} ₫` : "Chưa có";

const parseNumberInput = (v: string | undefined): number => {
  const parsed = Number((v || "").toString().replace(/,/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

interface Props {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicle: IVehicle | null;
  onUpdated?: (next: IVehicle) => void;
}

export default function VehiclePriceUpdateModal({
  open,
  onClose,
  vehicleId,
  vehicle,
  onUpdated,
}: Props) {
  const [form] = Form.useForm<{ importPrice: number; retailPrice: number }>();
  const updatePrices = useUpdateVehiclePrices();
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    if (open && vehicle) {
      form.setFieldsValue({
        importPrice: vehicle.importPrice ?? 0,
        retailPrice: vehicle.retailPrice ?? 0,
      });
    }
  }, [open, vehicle, form]);

  const handleSubmit = async (values: {
    importPrice: number;
    retailPrice: number;
  }) => {
    if (!vehicle) return;

    const oldImport = vehicle.importPrice ?? 0;
    const oldRetail = vehicle.retailPrice ?? 0;
    const sameImport = values.importPrice === oldImport;
    const sameRetail = values.retailPrice === oldRetail;

    if (sameImport && sameRetail) {
      toast.info("Không có thay đổi nào để cập nhật.");
      return;
    }

    try {
      await updatePrices.mutateAsync({ id: vehicleId, data: values });

      const nextVehicle: IVehicle = {
        ...vehicle,
        importPrice: values.importPrice,
        retailPrice: values.retailPrice,
      };

      onUpdated?.(nextVehicle);
      toast.success("Giá xe đã được cập nhật thành công!");
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Không thể cập nhật giá. Vui lòng thử lại sau.");
    }
  };

  const fullName = `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""}`.trim();

  const requestClose = () => {
    if (updatePrices.isPending) return;

    const touched = form.isFieldsTouched();
    if (!touched) {
      onClose();
      return;
    }
    setConfirmDiscardOpen(true);
  };

  const handleConfirmDiscard = () => {
    form.resetFields();
    setConfirmDiscardOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={requestClose}
        width={720}
        destroyOnClose
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#627254]">
              <DollarOutlined className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base text-[#414d38]">
                Cập nhật giá xe
              </span>
              <span className="text-[12px] text-gray-500">
                Chỉ Admin được phép chỉnh sửa giá nhập và giá bán lẻ.
              </span>
            </div>
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updatePrices.isPending}
              className="!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] rounded-md"
            >
              Lưu cập nhật giá
            </Button>
          </div>
        }
      >
        {!vehicle ? (
          <div className="text-center text-gray-500 text-sm">
            Không tìm thấy thông tin mẫu xe.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            {/* Thông tin hiện tại */}
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CarOutlined className="text-[#627254]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mẫu xe</p>
                  <p className="font-semibold text-[15px] text-[#414d38]">
                    {fullName || vehicle.id}
                  </p>
                  {vehicle.brand && (
                    <p className="text-xs text-gray-500 mt-1">
                      Hãng: {vehicle.brand}
                    </p>
                  )}
                </div>
              </div>

              <Divider className="my-3" />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giá nhập hiện tại</span>
                  <Tag className="rounded-full bg-[#f5f7f0] border-none text-[#414d38]">
                    {formatCurrency(vehicle.importPrice)}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giá bán lẻ hiện tại</span>
                  <Tag className="rounded-full bg-[#f5f7f0] border-none text-[#414d38]">
                    {formatCurrency(vehicle.retailPrice)}
                  </Tag>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                Lưu ý: Giá mới sẽ áp dụng cho các nhập lô xe mới dựa trên mẫu xe
                này. Các hợp đồng và đơn hàng đã tạo trước đó không bị thay đổi.
              </p>
            </div>

            {/* Form cập nhật giá */}
            <div>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-3"
              >
                <Form.Item
                  label="Giá nhập (VNĐ)"
                  name="importPrice"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá nhập!" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={parseNumberInput}
                  />
                </Form.Item>

                <Form.Item
                  label="Giá bán lẻ (VNĐ)"
                  name="retailPrice"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá bán lẻ!" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={parseNumberInput}
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Modal>

      <DeleteConfirm
        open={confirmDiscardOpen}
        onCancel={() => setConfirmDiscardOpen(false)}
        onConfirm={handleConfirmDiscard}
        title="Hủy thay đổi giá?"
        message="Các thay đổi giá chưa được lưu sẽ bị mất. Bạn có chắc chắn muốn hủy?"
        okText="Hủy thay đổi"
        danger
      />
    </>
  );
}
