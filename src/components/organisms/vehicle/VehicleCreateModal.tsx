// src/components/organisms/vehicle/VehicleCreateModal.tsx
import { Card, Button, Space, Form, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { VehicleForm } from "../../molecules/EVM/VehicleForm";
import { useCreateVehicle } from "../../../service/vehicleService";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import type { IVehicle } from "../../../model/Vehicle";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ROUTES } from "../../../model/routePaths";
import { getRoleBasePath } from "../../../utils/roleGuard";
import type { UploadFile } from "antd/es/upload";
import { uploadFiles } from "../../../utils/uploadFile";
import { CarOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

export const VehicleCreateModal = () => {
  const [form] = Form.useForm<IVehicle>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createVehicle = useCreateVehicle();

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";
  const basePath = getRoleBasePath(user);

  useEffect(() => {
    if (role !== "EVM_STAFF") {
      toast.warning("Tài khoản của bạn không có quyền thêm xe mới!");
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`, { replace: true });
    }
  }, [role, navigate, basePath]);

  const handleCreate = async (values: IVehicle) => {
    try {
      const fileList =
        (values.images as unknown as UploadFile[] | undefined) ?? [];
      const rawFiles =
        fileList
          .map((f) =>
            f.originFileObj instanceof File ? f.originFileObj : null
          )
          .filter((f): f is NonNullable<typeof f> => f !== null) ?? [];

      const uploadedUrls =
        rawFiles.length > 0 ? await uploadFiles(rawFiles) : [];

      const payload: IVehicle = {
        ...values,
        images:
          uploadedUrls.length > 0
            ? uploadedUrls
            : ["https://placehold.co/300x200?text=Vehicle"],
      };

      await createVehicle.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["get-vehicles"] });

      toast.success("Thêm xe mới thành công!");
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`);
    } catch (err: unknown) {
      console.error("❌ Lỗi khi tạo xe:", err);
      toast.error("Không thể thêm xe!");
    }
  };

  const handleCancel = () => {
    const isDirty = form.isFieldsTouched();

    if (isDirty) {
      Modal.confirm({
        title: "Hủy tạo xe mới?",
        content: "Các thông tin đã nhập sẽ bị mất. Bạn có chắc chắn muốn hủy?",
        okText: "Hủy tạo",
        cancelText: "Tiếp tục chỉnh sửa",
        okButtonProps: { danger: true },
        onOk: () => {
          navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`);
        },
      });
    } else {
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[90vh] bg-gray-50 py-10 px-4">
      <Card
        title={
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CarOutlined className="text-[#627254]" />
              <span className="text-lg font-semibold">Thêm xe điện mới</span>
            </div>
            <span className="text-xs text-gray-500">
              Nhập thông tin model xe, hình ảnh và thông số cơ bản để thêm vào
              hệ thống.
            </span>
          </div>
        }
        className="w-full max-w-4xl shadow-md rounded-2xl"
        styles={{
          header: { borderBottom: "1px solid #f0f0f0" },
          body: { paddingTop: 24, paddingBottom: 24 },
        }}
      >
        <VehicleForm
          form={form}
          onFinish={handleCreate}
          canEditPrices={false}
        />

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          <Space>
            <Button
              onClick={handleCancel}
              className="rounded-md"
              disabled={createVehicle.isPending}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createVehicle.isPending}
              className="!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] rounded-md"
            >
              Tạo xe
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default VehicleCreateModal;
