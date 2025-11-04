import { useEffect, useState, useMemo } from "react";
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
  Alert,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useGetVehicleById,
  useCreateVehicleUnitsBulk,
} from "../../service/vehicleService";
import { ROUTES } from "../../model/routePaths";
import { useCurrentUser } from "../../utils/getCurrentUser";
import api from "../../config/api";

const { Option } = Select;

export const VehicleBulkPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleId = new URLSearchParams(location.search).get("vehicleId");

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

  const { vehicle: vehicleInfo, isLoading: vehicleLoading } = useGetVehicleById(
    vehicleId ?? "",
    { enabled: !!vehicleId }
  );

  const { mutateAsync: bulkCreate, isPending } = useCreateVehicleUnitsBulk();

  const [multiplier, setMultiplier] = useState<number>(1);

  const baseRetail = useMemo(
    () =>
      typeof vehicleInfo?.retailPrice === "number"
        ? vehicleInfo.retailPrice
        : 0,
    [vehicleInfo]
  );

  const previewPrice = useMemo(
    () => Math.round((baseRetail || 0) * (multiplier || 1)),
    [baseRetail, multiplier]
  );

  type FormValues = {
    quantity: number;
    color: string;
    productionYear: Dayjs;
    status:
      | "NORMAL"
      | "SPECIAL"
      | "OLD_STOCK"
      | "TEST_DRIVE"
      | "RESERVED"
      | "SOLD";
  };

  const fetchMultiplier = async (status: FormValues["status"]) => {
    try {
      const res = await api.get(`/vehicle-price-rules/${status}`);
      const newMultiplier = res?.data?.result?.multiplier;
      setMultiplier(typeof newMultiplier === "number" ? newMultiplier : 1);
    } catch {
      setMultiplier(1);
      message.error("Không thể lấy multiplier của price rule!");
    }
  };

  const handleStatusChange = async (status: FormValues["status"]) => {
    fetchMultiplier(status);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!vehicleId) {
      message.error("Thiếu vehicleId. Vui lòng quay lại.");
      return;
    }
    try {
      await bulkCreate({
        vehicleId,
        quantity: values.quantity,
        color: values.color,
        productionYear: dayjs(values.productionYear).format("YYYY-01-01"),
        status: values.status,
      });

      message.success(
        `✅ Nhập ${values.quantity} xe (${
          values.status
        }) thành công — Giá/xe ước tính: ${previewPrice.toLocaleString()}₫`
      );

      // Điều hướng về trang DETAIL của mẫu xe (replace + state.from = 'bulk')
      navigate(
        `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", vehicleId),
        { replace: true, state: { from: "bulk" } }
      );
    } catch (err: unknown) {
      const maybeAxios = err as {
        response?: { data?: { message?: string } };
        message?: string;
      } | null;
      const msg =
        maybeAxios?.response?.data?.message ||
        maybeAxios?.message ||
        "❌ Không thể nhập đơn vị xe. Vui lòng thử lại!";
      message.error(msg);
    }
  };

  const imageList: string[] = Array.isArray(vehicleInfo?.images)
    ? vehicleInfo.images.filter((u: string) => !!u && /^https?:\/\//i.test(u))
    : [];
  const mainImage =
    imageList[0] || "https://placehold.co/400x300?text=No+Image";

  useEffect(() => {
    if (!vehicleId) {
      message.error("Thiếu vehicleId");
      navigate(-1);
    }
  }, [vehicleId, navigate]);

  // Lấy multiplier lần đầu (status mặc định NORMAL)
  useEffect(() => {
    fetchMultiplier("NORMAL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex justify-center min-h-[90vh] bg-gray-50 py-10 px-4">
      <Card
        bordered={false}
        className="w-full max-w-5xl shadow-md rounded-2xl p-6"
        title={
          <div className="flex justify-between items-center">
            <span>🚗 Nhập kho hàng loạt xe điện (Vehicle Units)</span>
            <Button
              onClick={() => navigate(-1)}
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
            {/* ẢNH & THÔNG TIN MẪU XE */}
            <div className="flex-1 flex flex-col items-center">
              <Image
                src={mainImage}
                alt="vehicle"
                width={420}
                height={300}
                className="rounded-lg shadow-sm border object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://placehold.co/420x300?text=No+Image";
                }}
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-[#627254]">
                  {vehicleInfo.brand} – {vehicleInfo.model}
                </h3>
                <p className="text-gray-500 text-sm">
                  Loại: {vehicleInfo.type} | Pin: {vehicleInfo.batteryKwh} kWh |
                  Tầm: {vehicleInfo.rangeKm} km
                </p>
                <p className="text-gray-700 font-medium mt-2">
                  Giá bán lẻ (model):{" "}
                  <span className="text-[#627254]">
                    {typeof vehicleInfo.retailPrice === "number"
                      ? vehicleInfo.retailPrice.toLocaleString()
                      : "Chưa có"}
                    ₫
                  </span>
                </p>
                <Alert
                  className="mt-3"
                  type="info"
                  showIcon
                  message="Giá đơn vị sẽ do hệ thống tính: retail_price_model × multiplier(status)"
                />
              </div>
            </div>

            {/* FORM NHẬP LÔ */}
            <div className="flex-1">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  quantity: 1,
                  status: "NORMAL",
                  productionYear: dayjs(),
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
                    label="Giá dự kiến (Retail × Multiplier)"
                    className="flex-1"
                  >
                    <InputNumber
                      value={previewPrice}
                      readOnly
                      className="w-full"
                      formatter={(value) =>
                        `${Number(value || 0).toLocaleString()}`
                      }
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {baseRetail.toLocaleString()}₫ × {multiplier}
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
                  loading={isPending}
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

export default VehicleBulkPage;
