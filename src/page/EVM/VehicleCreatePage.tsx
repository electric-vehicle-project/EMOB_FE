import { Card, message, Button, Space, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { VehicleForm } from "../../components/molecules/evm/VehicleForm";
import {
  useCreateVehicle,
  useUploadVehicleImages,
} from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import type { IVehicle } from "../../model/Vehicle";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const VehicleCreatePage = () => {
  const [form] = Form.useForm<IVehicle>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createVehicle = useCreateVehicle();
  const uploadImages = useUploadVehicleImages();

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  useEffect(() => {
    if (role !== "EVM_STAFF") {
      message.warning("Tài khoản của bạn không có quyền thêm xe mới!");
      navigate("/dashboard/evm/vehicle", { replace: true });
    }
  }, [role, navigate]);

  const handleCreate = async (values: IVehicle) => {
    try {
      const formData = new FormData();
      ((values.images as (File | { originFileObj?: File })[]) || []).forEach(
        (file: File | { originFileObj?: File }) => {
          const origin =
            "originFileObj" in file ? file.originFileObj || file : file;
          if (origin instanceof File) formData.append("files", origin);
        }
      );

      let imageUrls: string[] = [];
      if (formData.has("files")) {
        const uploadRes = await uploadImages.mutateAsync(formData);
        imageUrls =
          uploadRes?.data?.result || uploadRes?.result || uploadRes || [];
      }

      const payload = {
        ...values,
        images: imageUrls.length
          ? imageUrls
          : ["https://via.placeholder.com/300x200?text=Vehicle"],
        type:
          typeof values.type === "object" &&
          values.type !== null &&
          "value" in values.type
            ? (values.type as { value: string }).value
            : values.type,
      };

      await createVehicle.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      message.success("✅ Thêm xe mới thành công!");
      navigate("/dashboard/evm/vehicle");
    } catch (err: unknown) {
      console.error("❌ Lỗi khi tạo xe:", err);
      message.error("❌ Không thể thêm xe!");
    }
  };

  const handleCancel = () => navigate("/dashboard/evm/vehicle");

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
