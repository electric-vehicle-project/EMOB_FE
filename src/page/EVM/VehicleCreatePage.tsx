import { Card, message, Button, Space, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { VehicleForm } from "../../components/molecules/EVM/VehicleForm";
import {
  useCreateVehicle,
  useUploadVehicleImages,
} from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import type { IVehicle } from "../../model/Vehicle";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ROUTES } from "../../model/routePaths";
import { getRoleBasePath } from "../../utils/roleGuard";

export const VehicleCreatePage = () => {
  const [form] = Form.useForm<IVehicle>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createVehicle = useCreateVehicle();
  const uploadImages = useUploadVehicleImages();

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
      const formData = new FormData();
      type UploadFileLike = File | { originFileObj?: File };
      const extractFile = (f: UploadFileLike): File | null => {
        if (f instanceof File) return f;
        const origin = (f as { originFileObj?: File }).originFileObj;
        return origin instanceof File ? origin : null;
      };
      ((values.images as UploadFileLike[]) || []).forEach((file) => {
        const origin = extractFile(file);
        if (origin) formData.append("files", origin);
      });

      let imageUrls: string[] = [];
      if (formData.has("files")) {
        const uploadRes = await uploadImages.mutateAsync(formData);
        const raw =
          (uploadRes as { data?: { result?: string[] } } | undefined)?.data
            ?.result ??
          (uploadRes as { result?: string[] } | undefined)?.result ??
          (Array.isArray(uploadRes) ? (uploadRes as string[]) : []);
        imageUrls = Array.isArray(raw) ? raw : [];
      }

      const normalizeType = (t: unknown): string | undefined => {
        if (typeof t === "string") return t;
        if (
          t !== null &&
          typeof t === "object" &&
          "value" in (t as Record<string, unknown>)
        ) {
          const v = (t as Record<string, unknown>).value;
          return typeof v === "string" ? v : undefined;
        }
        return undefined;
      };

      const payload = {
        ...values,
        images: imageUrls.length
          ? imageUrls
          : ["https://placehold.co/300x200?text=Vehicle"],
        type: normalizeType((values as unknown as { type?: unknown })?.type),
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
              loading={createVehicle.isPending || uploadImages.isPending}
            >
              Tạo xe
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};
