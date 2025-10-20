import { Card, message, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { VehicleForm } from "../../components/molecules/VehicleForm";
import { useCreateVehicle } from "../../service/vehicleService";
import type { IVehicle } from "../../model/Vehicle";
import { useCurrentUser } from "../../utils/getCurrentUser";

export const VehicleCreatePage = () => {
  const navigate = useNavigate();
  const createVehicle = useCreateVehicle();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  // ✅ Hàm xử lý khi bấm Tạo xe
  const handleCreate = async (values: IVehicle) => {
    try {
      // ✅ Chuẩn hóa dữ liệu gửi BE
      const imageUrls =
        values.images
          ?.map((file: any) => {
            if (typeof file === "string") return file;

            // Nếu người dùng upload base64 thì thay bằng ảnh mẫu
            if (
              file.url?.startsWith("data:image") ||
              file.thumbUrl?.startsWith("data:image")
            ) {
              return "https://example.com/default-car.jpg";
            }

            if (file.url?.startsWith("http")) return file.url;
            return null;
          })
          .filter(Boolean) ?? [];

      const payload = {
        ...values,
        images: imageUrls,
        type: typeof values.type === "object" ? values.type.value : values.type,
      };

      console.log("📦 Payload gửi BE:", JSON.stringify(payload, null, 2));

      await createVehicle.mutateAsync(payload);
      message.success("✅ Thêm xe mới thành công!");
      navigate("/dashboard/evm/vehicle");
    } catch (err: any) {
      console.error("❌ Lỗi khi tạo xe:", err?.response?.data || err);
      message.error(err?.response?.data?.message || "❌ Không thể thêm xe!");
    }
  };

  // ✅ Nút Hủy
  const handleCancel = () => {
    navigate("/dashboard/evm/vehicle");
  };

  return (
    <div className="flex justify-center items-start min-h-[90vh] bg-gray-50 py-10">
      <Card
        title="Thêm xe mới"
        className="w-full max-w-3xl shadow-md rounded-2xl"
      >
        {/* ✅ Form tạo xe */}
        <VehicleForm
          onFinish={handleCreate}
          canEditPrices={role !== "EVM_STAFF"}
          form={undefined as any}
        />

        {/* ✅ Nút thao tác */}
        <div className="flex justify-end gap-3 mt-6">
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={() =>
                document
                  .querySelector("form")
                  ?.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                  )
              }
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
