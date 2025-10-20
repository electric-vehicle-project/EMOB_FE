import { useNavigate, useParams } from "react-router-dom";
import { Card, message, Spin, Form, Button, Space } from "antd";
import {
  useGetVehicleById,
  useUpdateVehicle,
} from "../../service/vehicleService";
import { VehicleForm } from "../../components/molecules/VehicleForm";
import type { IVehicle } from "../../model/Vehicle";

export const VehicleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Gọi API lấy thông tin xe
  const { data, isLoading } = useGetVehicleById(id ?? "");
  const updateVehicle = useUpdateVehicle();
  const vehicle = data?.result;

  const [form] = Form.useForm<IVehicle>();

  const handleSave = async (values: IVehicle) => {
    try {
      await updateVehicle.mutateAsync({ id: id!, data: values });
      message.success("✅ Cập nhật xe thành công!");
      navigate(`/dashboard/evm/vehicle/${id}`);
    } catch {
      message.error("❌ Không thể cập nhật xe!");
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/evm/vehicle/${id}`);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );

  if (!vehicle)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Card className="max-w-3xl w-full text-center shadow-md rounded-2xl">
          <p className="mb-4">Không tìm thấy xe.</p>
          <Button type="primary" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Card>
      </div>
    );

  // Đổ dữ liệu sau khi fetch xong
  form.setFieldsValue(vehicle);

  return (
    <div className="flex justify-center items-start min-h-[90vh] bg-gray-50 py-10">
      <Card
        title="Chỉnh sửa thông tin xe"
        className="w-full max-w-3xl shadow-md rounded-2xl"
      >
        <VehicleForm
          form={form}
          onFinish={handleSave}
          canEditPrices={false}
        />

        {/* ✅ Thêm 2 nút Lưu / Hủy */}
        <div className="flex justify-end gap-3 mt-6">
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateVehicle.isPending}
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};
