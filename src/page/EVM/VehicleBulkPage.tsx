import { useEffect, useState } from "react";
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
  Image,
  Space,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useGetVehicleById,
  useBulkCreateVehicleUnits,
} from "../../service/vehicleService";
import api from "../../config/api";
import { ROUTES } from "../../model/routePaths";
import { useCurrentUser } from "../../utils/getCurrentUser";

const { Option } = Select;

export const VehicleBulkPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { search } = useLocation();
  const vehicleId = new URLSearchParams(search).get("vehicleId");

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";
  const basePath =
    role === "ADMIN"
      ? "/admin"
      : role === "EVM_STAFF"
      ? "/evm_staff"
      : role === "MANAGER"
      ? "/manager"
      : "/dealer_staff";

  const { data: vehicleData, isLoading: vehicleLoading } = useGetVehicleById(
    vehicleId ?? ""
  );
  const bulkCreate = useBulkCreateVehicleUnits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const basePrice = vehicleData?.result?.importPrice ?? 0;

  type FormValues = {
    quantity: number;
    color: string;
    productionYear: Dayjs;
    purchaseDate: Dayjs;
    warrantyStart: Dayjs;
    warrantyEnd: Dayjs;
    status:
      | "NORMAL"
      | "SPECIAL"
      | "OLD_STOCK"
      | "TEST_DRIVE"
      | "RESERVED"
      | "SOLD";
  };

  const handleStatusChange = async (status: FormValues["status"]) => {
    try {
      const res = await api.get(`/vehicle-price-rules/${status}`);
      const newMultiplier = res?.data?.result?.multiplier ?? 1;
      setMultiplier(newMultiplier);
      setCalculatedPrice(basePrice * newMultiplier);
    } catch {
      message.error("Không thể lấy thông tin quy tắc giá!");
      setMultiplier(1);
      setCalculatedPrice(basePrice);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const finalPrice = basePrice * multiplier;

      await bulkCreate.mutateAsync({
        vehicleId: vehicleId ?? "",
        quantity: values.quantity,
        color: values.color,
        productionYear: dayjs(values.productionYear).format("YYYY-01-01"),
        purchaseDate: values.purchaseDate.toISOString(),
        warrantyStart: values.warrantyStart.format("YYYY-MM-DD"),
        warrantyEnd: values.warrantyEnd.format("YYYY-MM-DD"),
        status: values.status,
        price: finalPrice,
      });

      message.success(
        `✅ Nhập ${values.quantity} xe (${
          values.status
        }) thành công — Giá mỗi xe: ${finalPrice.toLocaleString()}₫`
      );

      setTimeout(() => {
        navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`);
      }, 800);
    } catch (error) {
      console.error(error);
      message.error("❌ Không thể nhập đơn vị xe. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleInfo = vehicleData?.result;
  const imageList: string[] = Array.isArray(vehicleInfo?.images)
    ? vehicleInfo.images.filter((u: string) => !!u && /^https?:\/\//i.test(u))
    : [];
  const mainImage =
    imageList[0] || "https://via.placeholder.com/400x300?text=No+Image";

  useEffect(() => {
    if (basePrice) setCalculatedPrice(basePrice * multiplier);
  }, [basePrice, multiplier]);

  return (
    <div className="flex justify-center min-h-[90vh] bg-gray-50 py-10 px-4">
      <Card
        bordered={false}
        className="w-full max-w-5xl shadow-md rounded-2xl p-6"
        title={
          <div className="flex justify-between items-center">
            <span>🚗 Nhập kho hàng loạt xe điện (Vehicle Units)</span>
            <Button
              onClick={() => navigate(`${basePath}/${ROUTES.EVM_VEHICLE}`)}
              className="rounded-lg border-gray-300"
            >
              Quay lại
            </Button>
          </div>
        }
      >
        {vehicleLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : vehicleInfo ? (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* 🖼️ Hình xe */}
            <div className="flex-1 flex flex-col items-center">
              <Image
                src={mainImage}
                alt="vehicle"
                width={420}
                height={300}
                className="rounded-lg shadow-sm border object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/420x300?text=No+Image";
                }}
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-[#627254]">
                  {vehicleInfo.brand} – {vehicleInfo.model}
                </h3>
                <p className="text-gray-500 text-sm">
                  Loại: {vehicleInfo.type} | Pin: {vehicleInfo.batteryKwh} kWh |{" "}
                  Tầm hoạt động: {vehicleInfo.rangeKm} km
                </p>
                <p className="text-gray-700 font-medium mt-2">
                  Giá nhập:{" "}
                  <span className="text-[#627254]">
                    {vehicleInfo.importPrice?.toLocaleString()}₫
                  </span>
                </p>
              </div>
            </div>

            {/* 📋 Form nhập liệu */}
            <div className="flex-1">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  quantity: 1,
                  status: "NORMAL",
                  purchaseDate: dayjs(),
                  warrantyStart: dayjs().add(5, "day"),
                  warrantyEnd: dayjs().add(3, "year"),
                }}
                className="space-y-2"
              >
                <Space direction="horizontal" size="middle" className="w-full">
                  <Form.Item
                    label="Số lượng cần nhập"
                    name="quantity"
                    className="flex-1"
                    rules={[{ required: true, message: "Nhập số lượng" }]}
                  >
                    <InputNumber min={1} className="w-full" />
                  </Form.Item>

                  <Form.Item
                    label="Giá dự kiến (Import Price × Multiplier)"
                    className="flex-1"
                  >
                    <InputNumber
                      value={calculatedPrice}
                      readOnly
                      className="w-full"
                      formatter={(value) =>
                        `${Number(value || 0).toLocaleString()}`
                      }
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {basePrice.toLocaleString()}₫ × {multiplier}
                    </div>
                  </Form.Item>
                </Space>

                <Form.Item
                  label="Màu sơn"
                  name="color"
                  rules={[{ required: true, message: "Nhập màu sơn" }]}
                >
                  <Input placeholder="Ví dụ: Trắng" />
                </Form.Item>

                <Form.Item
                  label="Năm sản xuất"
                  name="productionYear"
                  rules={[{ required: true, message: "Chọn năm sản xuất" }]}
                >
                  <DatePicker picker="year" className="w-full" />
                </Form.Item>

                <Space direction="horizontal" size="middle" className="w-full">
                  <Form.Item
                    label="Ngày mua (Purchase Date)"
                    name="purchaseDate"
                    className="flex-1"
                    rules={[{ required: true, message: "Chọn ngày mua" }]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>

                  <Form.Item
                    label="Ngày bảo hành bắt đầu"
                    name="warrantyStart"
                    className="flex-1"
                    rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                </Space>

                <Form.Item
                  label="Ngày bảo hành kết thúc"
                  name="warrantyEnd"
                  rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item
                  label="Tình trạng ban đầu"
                  name="status"
                  rules={[{ required: true, message: "Chọn tình trạng xe" }]}
                >
                  <Select onChange={handleStatusChange}>
                    <Option value="NORMAL">Xe mới (bình thường)</Option>
                    <Option value="SPECIAL">Xe trưng bày / đặc biệt</Option>
                    <Option value="OLD_STOCK">
                      Xe tồn kho cũ / chuyển kho
                    </Option>
                    <Option value="TEST_DRIVE">Xe lái thử</Option>
                    <Option value="RESERVED">Xe được đặt giữ chỗ</Option>
                    <Option value="SOLD">Xe đã bán</Option>
                  </Select>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  block
                  className="bg-[#627254] hover:bg-[#76885B] text-white font-semibold rounded-lg mt-6 py-2"
                >
                  Nhập kho
                </Button>
              </Form>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400">
            Không tìm thấy thông tin xe.
          </p>
        )}
      </Card>
    </div>
  );
};
