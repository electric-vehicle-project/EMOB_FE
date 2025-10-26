import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, InputNumber, Button, message, Spin } from "antd";
import {
  useUpdateVehiclePrices,
  useGetVehicleById,
} from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useEffect } from "react";

export const VehiclePriceUpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const updatePrices = useUpdateVehiclePrices();
  const { data, isLoading } = useGetVehicleById(id ?? "");
  const vehicle = data?.result;
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  // ✅ Nếu không phải Admin thì chặn luôn
  useEffect(() => {
    if (role !== "ADMIN") {
      message.warning("⚠️ Chỉ Admin mới có quyền cập nhật giá!");
      navigate(`/dashboard/evm/vehicle/${id}`, { replace: true });
    }
  }, [role, navigate, id]);

  // ✅ Gán giá trị ban đầu cho form
  useEffect(() => {
    if (vehicle) {
      form.setFieldsValue({
        importPrice: vehicle.importPrice,
        retailPrice: vehicle.retailPrice,
      });
    }
  }, [vehicle, form]);

  // ✅ Xử lý cập nhật giá
  const handleSubmit = async (values: {
    importPrice: number;
    retailPrice: number;
  }) => {
    // So sánh giá trị cũ & mới
    const oldImport = vehicle?.importPrice ?? 0;
    const oldRetail = vehicle?.retailPrice ?? 0;
    const sameImport = values.importPrice === oldImport;
    const sameRetail = values.retailPrice === oldRetail;

    if (sameImport && sameRetail) {
      message.info({
        content: "Không có thay đổi nào để cập nhật.",
        duration: 2.5,
      });
      return;
    }

    try {
      await updatePrices.mutateAsync({ id: id!, data: values });
      message.success({
        content: "💰 Giá xe đã được cập nhật thành công!",
        duration: 2.5,
      });
      navigate(`/dashboard/evm/vehicle/${id}`);
    } catch (error) {
      console.error("❌ Update error:", error);
      message.error({
        content: "Không thể cập nhật giá. Vui lòng thử lại sau.",
        duration: 2.5,
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="flex justify-center items-start min-h-[90vh] bg-gray-50 py-10">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Cập nhật giá xe</span>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
          </div>
        }
        className="w-full max-w-lg shadow-md rounded-2xl"
      >
        <div className="mb-6 text-gray-600 text-sm">
          <p>
            <strong>
              {vehicle?.brand} {vehicle?.model}
            </strong>
          </p>
          <p>
            Giá nhập hiện tại:{" "}
            <span className="font-semibold">
              {vehicle?.importPrice?.toLocaleString("vi-VN") ?? "Chưa có"} ₫
            </span>
          </p>
          <p>
            Giá bán lẻ hiện tại:{" "}
            <span className="font-semibold">
              {vehicle?.retailPrice?.toLocaleString("vi-VN") ?? "Chưa có"} ₫
            </span>
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Giá nhập (VNĐ)"
            name="importPrice"
            rules={[{ required: true, message: "Vui lòng nhập giá nhập!" }]}
          >
            <InputNumber
              min={0}
              className="w-full"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>

          <Form.Item
            label="Giá bán lẻ (VNĐ)"
            name="retailPrice"
            rules={[{ required: true, message: "Vui lòng nhập giá bán lẻ!" }]}
          >
            <InputNumber
              min={0}
              className="w-full"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={updatePrices.isPending}
            block
          >
            Cập nhật giá
          </Button>
        </Form>
      </Card>
    </div>
  );
};
