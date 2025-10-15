import { Form, Input, InputNumber, Select } from "antd";
import type { FormInstance } from "antd";
import type { IVehicle } from "../../model/Vehicle";

interface Props {
  form: FormInstance<IVehicle>;
  onFinish: (values: IVehicle) => void;
  canEditPrices?: boolean;
}

const { Option } = Select;

export const VehicleForm = ({ form, onFinish, canEditPrices }: Props) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Hãng xe"
        name="brand"
        rules={[{ required: true, message: "Vui lòng nhập hãng xe" }]}
      >
        <Input placeholder="Ví dụ: VinFast, Tesla..." />
      </Form.Item>

      <Form.Item
        label="Mẫu xe"
        name="model"
        rules={[{ required: true, message: "Vui lòng nhập mẫu xe" }]}
      >
        <Input placeholder="Ví dụ: VF8, Model S..." />
      </Form.Item>

      {canEditPrices && (
        <>
          <Form.Item label="Giá nhập (VNĐ)" name="importPrice">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Giá bán lẻ (VNĐ)" name="retailPrice">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </>
      )}

      <Form.Item label="Dung lượng pin (kWh)" name="batteryKwh">
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item label="Quãng đường tối đa (km)" name="rangeKm">
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item label="Thời gian sạc (giờ)" name="chargeTimeHr">
        <InputNumber min={0} step={0.1} className="w-full" />
      </Form.Item>

      <Form.Item label="Công suất (kW)" name="powerKw">
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item label="Khối lượng (kg)" name="weightKg">
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item label="Tốc độ tối đa (km/h)" name="topSpeedKmh">
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item label="Loại xe" name="type">
        <Select placeholder="Chọn loại xe">
          <Option value="SEDAN">Sedan</Option>
          <Option value="SUV">SUV</Option>
          <Option value="MOTORBIKE">Xe máy điện</Option>
          <Option value="TRUCK">Xe tải điện</Option>
          <Option value="OTHER">Khác</Option>
        </Select>
      </Form.Item>
    </Form>
  );
};
