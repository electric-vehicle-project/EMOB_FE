import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, InputNumber, Button, message } from "antd";
import { useUpdateVehiclePrices } from "../../service/vehicleService";

export const VehiclePriceUpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const updatePrices = useUpdateVehiclePrices();

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

  return (
    <div className="p-6">
      <Card
        title="Cập nhật giá xe"
        extra={<Button onClick={() => navigate(-1)}>Quay lại</Button>}
        className="max-w-[480px] mx-auto shadow-md"
      >
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
