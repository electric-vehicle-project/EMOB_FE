import { useState } from "react";
import {
  Card,
  Form,
  InputNumber,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useGetVehicleById,
  useBulkCreateVehicleUnits,
} from "../../service/vehicleService";
import { ROUTES } from "../../model/routePaths";

const { Option } = Select;

export const VehicleBulkPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { search } = useLocation();
  const vehicleId = new URLSearchParams(search).get("vehicleId");

  const { data: vehicleData, isLoading: vehicleLoading } = useGetVehicleById(
    vehicleId ?? ""
  );
  const bulkCreate = useBulkCreateVehicleUnits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  type FormValues = {
    quantity: number;
    color: string;
    productionYear: Dayjs;
    status:
      | "SPECIAL"
      | "TEST_DRIVE"
      | "RESERVED"
      | "OLD_STOCK"
      | "NORMAL"
      | "SOLD";
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await bulkCreate.mutateAsync({
        vehicleId: vehicleId ?? "",
        quantity: values.quantity,
        color: values.color,
        productionYear: dayjs(values.productionYear).format("YYYY-01-01"), // ✅ đúng swagger
        status: values.status,
      });
      message.success(
        `✅ Nhập thành công ${values.quantity} xe màu ${values.color}!`
      );
      navigate(`/${ROUTES.DASHBOARD}/${ROUTES.EVM_VEHICLE}`);
    } catch {
      message.error("❌ Không thể nhập đơn vị xe. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleInfo = vehicleData?.result;

  const statusStyles: Record<
    FormValues["status"],
    { label: string; color: string; emoji: string }
  > = {
    NORMAL: { label: "Xe mới (bình thường)", color: "#4CAF50", emoji: "🟢" },
    SPECIAL: {
      label: "Xe trưng bày / đặc biệt",
      color: "#9C27B0",
      emoji: "🟣",
    },
    OLD_STOCK: {
      label: "Xe tồn kho cũ / chuyển kho",
      color: "#FF9800",
      emoji: "🟠",
    },
    TEST_DRIVE: { label: "Xe lái thử", color: "#2196F3", emoji: "🔵" },
    RESERVED: {
      label: "Xe đã được đặt giữ chỗ",
      color: "#FFEB3B",
      emoji: "🟡",
    },
    SOLD: { label: "Xe đã bán cho khách hàng", color: "#F44336", emoji: "🔴" },
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] bg-gray-50">
      <Card
        bordered={false}
        className="w-full max-w-[650px] shadow-md rounded-2xl p-6"
        title="🚗 Nhập kho hàng loạt xe điện (Vehicle Units)"
      >
        {vehicleLoading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : (
          vehicleInfo && (
            <div className="mb-6 p-4 rounded-xl bg-[#f8f9fa] border">
              <p className="text-gray-500 mb-1 text-sm">
                Đang nhập kho cho mẫu xe:
              </p>
              <h3 className="text-lg font-semibold text-[#627254]">
                {vehicleInfo.brand} – {vehicleInfo.model}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Loại: {vehicleInfo.type} | Pin: {vehicleInfo.batteryKwh} kWh |{" "}
                Tầm hoạt động: {vehicleInfo.rangeKm} km
              </p>
            </div>
          )
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ quantity: 1, status: "NORMAL" }}
        >
          <Form.Item
            label="Số lượng cần nhập"
            name="quantity"
            rules={[{ required: true, message: "Nhập số lượng" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Màu sơn"
            name="color"
            rules={[{ required: true, message: "Nhập màu sơn" }]}
          >
            <Input placeholder="Ví dụ: Trắng, Đen, Xanh..." />
          </Form.Item>

          <Form.Item
            label="Năm sản xuất"
            name="productionYear"
            rules={[{ required: true, message: "Chọn năm sản xuất" }]}
          >
            <DatePicker picker="year" className="w-full" />
          </Form.Item>

          <Form.Item
            label="Tình trạng ban đầu"
            name="status"
            rules={[{ required: true, message: "Chọn tình trạng xe" }]}
          >
            <Select placeholder="Chọn tình trạng xe khi nhập kho">
              {Object.entries(statusStyles).map(
                ([value, { label, color, emoji }]) => (
                  <Option key={value} value={value}>
                    <span
                      style={{
                        color,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {emoji} {label}
                    </span>
                  </Option>
                )
              )}
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            className="bg-[#627254] hover:bg-[#76885B] text-white font-semibold rounded-lg mt-4"
          >
            Nhập kho
          </Button>
        </Form>
      </Card>
    </div>
  );
};
