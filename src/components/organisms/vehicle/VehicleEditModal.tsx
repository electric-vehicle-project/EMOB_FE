// src/components/organisms/vehicle/VehicleEditModal.tsx
import type { FC } from "react";
import { Modal, Form, Button, Space, Spin } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type { UploadFile } from "antd/es/upload";
import { toast } from "react-toastify";

import type { IVehicle } from "../../../model/Vehicle";
import { useUpdateVehicle } from "../../../service/vehicleService";
import { VehicleForm } from "../../molecules/EVM/VehicleForm";
import { normalizeInitialFileList } from "../../molecules/EVM/vehicleForm.utils";
import { uploadFiles } from "../../../utils/uploadFile";
import { DeleteConfirm } from "../DeleteConfirm";

interface VehicleEditModalProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicle?: IVehicle | null;
  loading?: boolean;
  /** callback để detail page cập nhật UI ngay sau khi lưu */
  onUpdated?: (vehicle: IVehicle) => void;
}

export const VehicleEditModal: FC<VehicleEditModalProps> = ({
  open,
  onClose,
  vehicleId,
  vehicle,
  loading,
  onUpdated,
}) => {
  const [form] = Form.useForm<IVehicle>();
  const updateVehicle = useUpdateVehicle();
  const initialValuesRef = useRef<IVehicle | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  useEffect(() => {
    if (open && vehicle) {
      const withUploadList: IVehicle = {
        ...vehicle,
        images: normalizeInitialFileList(vehicle.images as string[]),
      } as unknown as IVehicle;

      form.setFieldsValue(withUploadList);
      initialValuesRef.current = withUploadList;
    }

    if (!open) {
      form.resetFields();
      initialValuesRef.current = null;
    }
  }, [open, vehicle, form]);

  const isFormChanged = (): boolean => {
    const current = form.getFieldsValue();
    const initial = initialValuesRef.current;
    if (!initial) return false;
    return JSON.stringify(current) !== JSON.stringify(initial);
  };

  const handleSave = async (values: IVehicle) => {
    if (!isFormChanged()) {
      toast.warning("Không có thay đổi nào để lưu.");
      return;
    }

    try {
      const fileList =
        (values.images as unknown as UploadFile[] | undefined) ?? [];

      const oldUrls =
        fileList
          .filter((f) => !!f.url && !f.originFileObj)
          .map((f) => String(f.url)) ?? [];

      const newFiles =
        fileList
          .filter((f) => f.originFileObj instanceof File)
          .map((f) => f.originFileObj as File) ?? [];

      const newUrls =
        newFiles.length > 0 ? await uploadFiles(newFiles as File[]) : [];

      const payload: IVehicle = {
        ...values,
        images: [...oldUrls, ...newUrls],
      };

      await updateVehicle.mutateAsync({ id: vehicleId, data: payload });

      const merged: IVehicle = {
        ...(vehicle ?? ({} as IVehicle)),
        ...payload,
        id: (vehicle?.id ?? vehicleId) as string,
      };

      onUpdated?.(merged);

      toast.success("Đã lưu thay đổi xe thành công!");
      onClose();
    } catch {
      toast.error("Không thể cập nhật xe!");
    }
  };

  const handleCancel = () => {
    if (!isFormChanged()) {
      onClose();
      return;
    }
    setCancelConfirmOpen(true);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
        title={
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <EditOutlined className="text-[#627254]" />
              <span className="text-lg font-semibold">
                Chỉnh sửa thông tin mẫu xe
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Cập nhật thông tin model, hình ảnh và thông số kỹ thuật.
            </span>
          </div>
        }
      >
        {loading && !vehicle ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : !vehicle ? (
          <div className="py-8 text-center text-gray-500">
            Không tìm thấy dữ liệu mẫu xe.
          </div>
        ) : (
          <>
            <VehicleForm
              form={form}
              onFinish={handleSave}
              canEditPrices={false}
            />

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              <Space>
                <Button
                  onClick={handleCancel}
                  className="rounded-md"
                  disabled={updateVehicle.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={updateVehicle.isPending}
                  className="!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] rounded-md"
                >
                  Lưu thay đổi
                </Button>
              </Space>
            </div>
          </>
        )}
      </Modal>

      <DeleteConfirm
        open={cancelConfirmOpen}
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          setCancelConfirmOpen(false);
          form.resetFields();
          initialValuesRef.current = null;
          onClose();
        }}
        title="Hủy chỉnh sửa?"
        message="Mọi thay đổi chưa lưu sẽ bị mất."
        okText="Hủy chỉnh sửa"
        danger
      />
    </>
  );
};

export default VehicleEditModal;
