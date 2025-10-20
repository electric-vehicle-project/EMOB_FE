import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, InputNumber, Button, message, Spin } from "antd";
import {
  useUpdateVehiclePrices,
  useGetVehicleById,
} from "../../service/vehicleService";
import { useEffect } from "react";

export const VehiclePriceUpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const updatePrices = useUpdateVehiclePrices();
  const { data, isLoading } = useGetVehicleById(id ?? "");
  const vehicle = data?.result;

  // ✅ Đổ giá cũ vào form
  useEffect(() => {
    if (vehicle) {
      form.setFieldsValue({
        importPrice: vehicle.importPrice,
        retailPrice: vehicle.retailPrice,
      });
    }
  }, [vehicle, form]);

  const handleSubmit = async (values: {
    importPrice: number;
    retailPrice: number;
  }) => {
    try {
      await updatePrices.mutateAsync({ id: id!, data: values });
      message.success("✅ Cập nhật giá thành công!");
      navigate(`/dashboard/evm/vehicle/${id}`);
    } catch {
      message.error("❌ Không thể cập nhật giá!");
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
            <span>Cập nhật giá xe</span>
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
            rules={[{ required: true, message: "Nhập giá nhập!" }]}
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
            rules={[{ required: true, message: "Nhập giá bán lẻ!" }]}
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
