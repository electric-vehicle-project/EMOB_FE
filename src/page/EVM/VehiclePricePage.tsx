import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Upload,
  Tag,
  Result,
} from "antd";
import type { UploadChangeParam, UploadFile } from "antd/es/upload";
import { UploadOutlined } from "@ant-design/icons";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useUpdateVehiclePrices } from "../../service/vehicleService";
import { useState } from "react";

export const VehiclePricePage = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [form] = Form.useForm();
  const updatePrices = useUpdateVehiclePrices();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

  // ⛔ Nếu không phải Admin thì chặn truy cập
  if (role !== "ADMIN") {
    return (
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle="Chỉ tài khoản Admin mới có thể cập nhật giá xe."
        extra={<Tag color="red">Quyền hiện tại: {role}</Tag>}
      />
    );
  }

  const handleSubmit = async (values: {
    importPrice: number;
    retailPrice: number;
    image?: string;
  }) => {
    try {
      await updatePrices.mutateAsync({
        id: vehicleId,
        data: {
          importPrice: values.importPrice,
          retailPrice: values.retailPrice,
        },
      });
      message.success("✅ Cập nhật giá xe thành công!");
      form.resetFields();
    } catch {
      message.error("❌ Không thể cập nhật giá xe!");
    }
  };

  const handleUpload = (info: UploadChangeParam<UploadFile>) => {
    const file = info.file;
    if (file.type !== "image/png") {
      message.error("Chỉ chấp nhận file PNG!");
      return;
    }
    if (file.status === "done" || file.originFileObj) {
      message.success("Tải hình thành công!");
      const blob = file.originFileObj as File | undefined;
      if (blob) form.setFieldValue("image", URL.createObjectURL(blob));
    }
  };

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Cập nhật giá xe điện</span>
            <Tag color="green" className="text-base font-medium">
              ADMIN
            </Tag>
          </div>
        }
        bordered={false}
        className="max-w-[520px] mx-auto shadow-md rounded-xl"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="ID Xe điện (UUID)"
            name="id"
            rules={[{ required: true, message: "Vui lòng nhập ID xe!" }]}
          >
            <Input
              placeholder="Nhập UUID xe"
              onChange={(e) => setVehicleId(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Giá nhập (VNĐ)"
            name="importPrice"
            rules={[{ required: true, message: "Nhập giá nhập" }]}
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
            rules={[{ required: true, message: "Nhập giá bán lẻ" }]}
          >
            <InputNumber
              min={0}
              className="w-full"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh xe (PNG)"
            name="image"
            tooltip="Tùy chọn — hình đại diện cho xe"
          >
            <Upload
              accept=".png"
              showUploadList={false}
              beforeUpload={() => false} // không upload tự động
              onChange={handleUpload}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh PNG</Button>
            </Upload>
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
