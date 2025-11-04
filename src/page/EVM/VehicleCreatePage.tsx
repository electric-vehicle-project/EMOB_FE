// src/pages/vehicle/VehicleCreatePage.tsx
import { Card, message, Button, Space, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { VehicleForm } from "../../components/molecules/EVM/VehicleForm";
import { useCreateVehicle } from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import type { IVehicle } from "../../model/Vehicle";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ROUTES } from "../../model/routePaths";
import { getRoleBasePath } from "../../utils/roleGuard";
import type { UploadFile } from "antd/es/upload";
import { uploadFiles } from "../../utils/uploadFile";

export const VehicleCreatePage = () => {
  const [form] = Form.useForm<IVehicle>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createVehicle = useCreateVehicle();

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";
  const basePath = getRoleBasePath(user);

  useEffect(() => {
    if (role !== "EVM_STAFF") {
      message.warning("Tài khoản của bạn không có quyền thêm xe mới!");
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`, { replace: true });
    }
  }, [role, navigate, basePath]);

  const handleCreate = async (values: IVehicle) => {
    try {
      // Lấy danh sách file ảnh mới (nếu có)
      const fileList =
        (values.images as unknown as UploadFile[] | undefined) ?? [];
      const rawFiles =
        fileList
          .map((f) =>
            f.originFileObj instanceof File ? f.originFileObj : null
          )
          .filter(Boolean) ?? [];

      // Upload lên Supabase → public URLs
      const uploadedUrls = await uploadFiles(rawFiles as File[]);

      const payload: IVehicle = {
        ...values,
        // Nếu không có ảnh thì dùng placeholder
        images:
          uploadedUrls.length > 0
            ? uploadedUrls
            : ["https://placehold.co/300x200?text=Vehicle"],
      };

      await createVehicle.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["get-vehicles"] });

      message.success("✅ Thêm xe mới thành công!");
      navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`);
    } catch (err: unknown) {
      console.error("❌ Lỗi khi tạo xe:", err);
      message.error("❌ Không thể thêm xe!");
    }
  };

  const handleCancel = () => navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`);

  return (
    <div className="flex justify-center items-start min-h-[90vh] bg-gray-50 py-10">
      <Card
        title="Thêm xe mới"
        className="w-full max-w-3xl shadow-md rounded-2xl"
      >
        <VehicleForm
          form={form}
          onFinish={handleCreate}
          canEditPrices={false}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createVehicle.isPending}
            >
              Tạo xe
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default VehicleCreatePage;
