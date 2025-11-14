import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Tooltip,
  Divider,
} from "antd";
import {
  PlusOutlined,
  InfoCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd";
import type { IVehicle } from "../../../model/Vehicle";

interface Props {
  form: FormInstance<IVehicle>;
  onFinish: (values: IVehicle) => void;
  canEditPrices?: boolean;
}

const { Option } = Select;

const formatNumber = {
  formatter: (v?: string | number) =>
    `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  parser: (v?: string) => (v ? v.replace(/,/g, "") : ""),
};

export const VehicleForm = ({ form, onFinish, canEditPrices }: Props) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-3"
    >
      {/* ===== Thông tin cơ bản ===== */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#414d38]">Thông tin cơ bản</h4>
          <Tooltip title="Điền hãng, mẫu và loại xe">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </div>
        <Divider className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Hãng xe"
            name="brand"
            rules={[{ required: true, message: "Vui lòng nhập hãng xe" }]}
            extra="Ví dụ: VinFast, Tesla…"
          >
            <Input placeholder="VinFast / Tesla…" allowClear />
          </Form.Item>

          <Form.Item
            label="Mẫu xe"
            name="model"
            rules={[{ required: true, message: "Vui lòng nhập mẫu xe" }]}
            extra="Ví dụ: VF8, Model S…"
          >
            <Input placeholder="VF8 / Model S…" allowClear />
          </Form.Item>

          {/* BE enum: SEDAN | SUV | HATCHBACK | TRUCK | MOTORBIKE */}
          <Form.Item
            label="Loại xe"
            name="type"
            rules={[{ required: true, message: "Chọn loại xe" }]}
          >
            <Select
              placeholder="Chọn loại xe"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              <Option value="SEDAN">Sedan</Option>
              <Option value="SUV">SUV</Option>
              <Option value="HATCHBACK">Hatchback</Option>
              <Option value="TRUCK">Xe tải điện</Option>
              <Option value="MOTORBIKE">Xe máy điện</Option>
            </Select>
          </Form.Item>

          {/* Chừa một ô trống để lưới cân đối */}
          <div className="hidden md:block" />
        </div>
      </div>

      {/* ===== Giá (nếu cho phép) ===== */}
      {canEditPrices && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[#414d38]">Giá</h4>
            <Tooltip title="Nhập giá nhập và giá bán lẻ (VNĐ)">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          </div>
          <Divider className="my-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Giá nhập (VNĐ)" name="importPrice">
              <InputNumber
                min={0}
                className="w-full"
                {...formatNumber}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item label="Giá bán lẻ (VNĐ)" name="retailPrice">
              <InputNumber
                min={0}
                className="w-full"
                {...formatNumber}
                placeholder="0"
              />
            </Form.Item>
          </div>
        </div>
      )}

      {/* ===== Thông số kỹ thuật ===== */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#414d38]">Thông số kỹ thuật</h4>
          <Tooltip title="Các thông số dùng để hiển thị & so sánh">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </div>
        <Divider className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Dung lượng pin (kWh)"
            name="batteryKwh"
            rules={[{ required: true, message: "Nhập dung lượng pin" }]}
          >
            <InputNumber
              min={0}
              className="w-full"
              step={1}
              placeholder="e.g. 82"
            />
          </Form.Item>

          <Form.Item
            label="Tầm hoạt động (km)"
            name="rangeKm"
            rules={[{ required: true, message: "Nhập tầm hoạt động" }]}
          >
            <InputNumber
              min={0}
              className="w-full"
              step={1}
              placeholder="e.g. 460"
            />
          </Form.Item>

          <Form.Item label="Thời gian sạc (giờ)" name="chargeTimeHr">
            <InputNumber
              min={0}
              step={0.1}
              className="w-full"
              placeholder="e.g. 7.5"
            />
          </Form.Item>

          <Form.Item label="Công suất (kW)" name="powerKw">
            <InputNumber
              min={0}
              className="w-full"
              step={1}
              placeholder="e.g. 150"
            />
          </Form.Item>

          <Form.Item label="Khối lượng (kg)" name="weightKg">
            <InputNumber
              min={0}
              className="w-full"
              step={1}
              placeholder="e.g. 2100"
            />
          </Form.Item>

          <Form.Item label="Tốc độ tối đa (km/h)" name="topSpeedKmh">
            <InputNumber
              min={0}
              className="w-full"
              step={1}
              placeholder="e.g. 200"
            />
          </Form.Item>
        </div>
      </div>

      {/* ===== Hình ảnh ===== */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[#414d38]">Hình ảnh xe</h4>
          <Tooltip title="Bạn có thể kéo-thả nhiều ảnh cùng lúc">
            <CameraOutlined className="text-gray-400" />
          </Tooltip>
        </div>
        <Divider className="my-3" />

        <Form.Item
          label="Thư viện ảnh"
          name="images"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
          extra="Chấp nhận ảnh bất kỳ; có thể chọn nhiều. Ảnh mới sẽ được upload khi bạn lưu."
        >
          <Upload
            listType="picture-card"
            multiple
            beforeUpload={() => false}
            accept="image/*"
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Tải lên</div>
            </div>
          </Upload>
        </Form.Item>
      </div>
    </Form>
  );
};
