import { Card, message, Button, Space, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { VehicleForm } from "../../components/molecules/VehicleForm";
import { useCreateVehicle } from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import type { IVehicle } from "../../model/Vehicle";
import { useQueryClient } from "@tanstack/react-query"; // ✅ thêm

export const VehicleCreatePage = () => {
  const [form] = Form.useForm<IVehicle>();
  const navigate = useNavigate();
  const createVehicle = useCreateVehicle();
  const queryClient = useQueryClient(); // ✅ thêm
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  const handleCreate = async (values: IVehicle) => {
    try {
      // ✅ Chuẩn hóa hình ảnh trước khi gửi
      const imageUrls =
        values.images
          ?.map((file: string | { url?: string; thumbUrl?: string }) => {
            if (typeof file === "string") return file;
            if (file.url) return file.url;
            if (file.thumbUrl && file.thumbUrl.startsWith("data:image"))
              return null; // bỏ base64, vì BE không nhận
            return null;
          })
          .filter(Boolean) ?? [];

      const payload = {
        ...values,
        images: imageUrls,
        type:
          typeof values.type === "object" &&
          values.type !== null &&
          "value" in values.type
            ? (values.type as { value: string }).value
            : values.type,
      };

      console.log("📦 Payload gửi BE:", JSON.stringify(payload, null, 2));

      await createVehicle.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      message.success("✅ Thêm xe mới thành công!");
      navigate("/dashboard/evm/vehicle");
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "❌ Không thể thêm xe!";
      console.error("❌ Lỗi khi tạo xe:", err);
      message.error(errorMsg);
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
          canEditPrices={role !== "EVM_STAFF"}
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
