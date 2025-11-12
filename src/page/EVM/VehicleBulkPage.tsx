import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Form,
  InputNumber,
  Input,
  DatePicker,
  Select,
  Button,
  Skeleton,
  Image,
  Space,
  Alert,
  Modal,
  Table,
  Tag,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  ExperimentOutlined,
  ReloadOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useGetVehicleById,
  useCreateVehicleUnitsBulk,
  // ✅ 2 hook AI mới (đã thêm trong service/vehicleService.ts)
  useGetAIDemandForecast,
  useCreateAIDemandForecasts,
} from "../../service/vehicleService";
import { ROUTES } from "../../model/routePaths";
import { useCurrentUser } from "../../utils/getCurrentUser";
import api from "../../config/api";
import { toast } from "react-toastify";

const { Option } = Select;

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

// ====== Kiểu dự báo chuẩn hoá, chỉ include field có thể áp vào form ======
type NormalizedForecast = {
  vehicleId?: string;
  modelId?: string;
  quantity?: number;
  color?: string;
  productionYear?: number;
  status?: FormValues["status"];
  confidence?: number; // 0..1
  note?: string;
  raw: Record<string, unknown>;
};

// ====== Chuẩn hoá 1 item bất kỳ từ BE thành NormalizedForecast ======
function normalizeForecastItem(
  item: Record<string, unknown>
): NormalizedForecast {
  const getNum = (keys: string[]): number | undefined => {
    for (const k of keys) {
      const v = item[k];
      if (typeof v === "number" && !Number.isNaN(v)) return v;
      if (
        typeof v === "string" &&
        v.trim() !== "" &&
        !Number.isNaN(Number(v))
      ) {
        return Number(v);
      }
    }
    return undefined;
  };

  const getStr = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = item[k];
      if (typeof v === "string" && v.trim() !== "") return v.trim();
    }
    return undefined;
  };

  const vehicleId = getStr(["vehicleId", "modelId", "id", "evModelId"]);
  const modelId = getStr(["modelId", "vehicleModelId"]);

  const quantity = getNum([
    "recommendedQty",
    "quantity",
    "qty",
    "suggestedQuantity",
  ]);
  const color = getStr(["color", "colour", "suggestedColor"]);
  const productionYear = getNum(["productionYear", "year", "suggestedYear"]);

  const statusRaw = getStr(["status", "vehicleStatus", "suggestedStatus"]);
  const status = ((): FormValues["status"] | undefined => {
    const s = (statusRaw ?? "").toUpperCase();
    const allowed = [
      "NORMAL",
      "SPECIAL",
      "OLD_STOCK",
      "TEST_DRIVE",
      "RESERVED",
      "SOLD",
    ];
    return allowed.includes(s) ? (s as FormValues["status"]) : undefined;
  })();

  let confidence = getNum(["confidence", "score", "probability"]);
  if (confidence && confidence > 1) confidence = confidence / 100;

  const note = getStr(["reason", "note", "explanation", "why"]);

  return {
    vehicleId,
    modelId,
    quantity,
    color,
    productionYear,
    status,
    confidence,
    note,
    raw: item,
  };
}

function forecastMatchesModel(
  f: NormalizedForecast,
  vehicleId: string,
  vehicleName: string
): boolean {
  if (f.vehicleId === vehicleId || f.modelId === vehicleId) return true;

  const brand =
    typeof f.raw["brand"] === "string" ? (f.raw["brand"] as string) : "";
  const model =
    typeof f.raw["model"] === "string" ? (f.raw["model"] as string) : "";
  const name = `${brand} ${model}`.trim().toLowerCase();

  if (brand || model) {
    return name.length > 0 && vehicleName.toLowerCase().includes(name);
  }
  return false;
}

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

  const fetchMultiplier = async (status: FormValues["status"]) => {
    try {
      const res = await api.get(`/vehicle-price-rules/${status}`);
      const newMultiplier = res?.data?.result?.multiplier;
      setMultiplier(typeof newMultiplier === "number" ? newMultiplier : 1);
    } catch {
      setMultiplier(1);
      toast.error("Không thể lấy multiplier của price rule!");
    }
  };

  const handleStatusChange = async (status: FormValues["status"]) => {
    fetchMultiplier(status);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!vehicleId) {
      toast.error("Thiếu vehicleId. Vui lòng quay lại.");
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

      toast.success(
        ` Nhập ${values.quantity} xe (${
          values.status
        }) thành công — Giá/xe ước tính: ${previewPrice.toLocaleString()}₫`
      );

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
      toast.error(msg);
    }
  };

  const imageList: string[] = Array.isArray(vehicleInfo?.images)
    ? vehicleInfo.images.filter((u: string) => !!u && /^https?:\/\//i.test(u))
    : [];
  const mainImage =
    imageList[0] || "https://placehold.co/400x300?text=No+Image";

  useEffect(() => {
    if (!vehicleId) {
      toast.error("Thiếu vehicleId");
      navigate(-1);
    }
  }, [vehicleId, navigate]);

  // Lấy multiplier lần đầu (status mặc định NORMAL)
  useEffect(() => {
    fetchMultiplier("NORMAL");
  }, []);

  // ================== DỰ BÁO AI ==================
  const [forecastOpen, setForecastOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);

  // Hook lấy dự báo (disable auto; mình refetch khi cần)
  const {
    forecasts,
    isLoading: loadingForecast,
    refetch,
  } = useGetAIDemandForecast({
    enabled: false,
    keepPreviousData: false,
  });

  // Hook trigger tạo/refresh dự báo phía AI
  const { mutateAsync: triggerCreate, isPending: triggering } =
    useCreateAIDemandForecasts();

  const vehicleName =
    `${vehicleInfo?.brand ?? ""} ${vehicleInfo?.model ?? ""}`.trim() ||
    String(vehicleId ?? "");

  const normalized = useMemo(() => {
    const raw = Array.isArray(forecasts) ? forecasts : [];
    return raw
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((x) => normalizeForecastItem(x));
  }, [forecasts]);

  const filteredForThisModel = useMemo(
    () =>
      normalized.filter(
        (f) => vehicleId && forecastMatchesModel(f, vehicleId, vehicleName)
      ),
    [normalized, vehicleId, vehicleName]
  );

  const openForecast = async () => {
    try {
      // 1) trigger tạo/refresh (theo swagger là GET)
      await triggerCreate();
    } catch {
      // cho phép tiếp tục dù trigger lỗi (trường hợp BE đã có cache)
    }
    // 2) lấy danh sách dự báo
    await refetch();
    // 3) mở modal
    setForecastOpen(true);
  };

  // ✅ Auto mở modal Dự báo AI khi vừa vào trang (chỉ 1 lần, chỉ cho EVM_STAFF)
  useEffect(() => {
    if (!autoOpened && role === "EVM_STAFF" && vehicleId && !vehicleLoading) {
      setAutoOpened(true);
      void openForecast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpened, role, vehicleId, vehicleLoading]);

  return (
    <div className="flex justify-center min-h-[90vh] bg-gray-50 py-10 px-4">
      <Card
        bordered={false}
        className="w-full max-w-5xl shadow-md rounded-2xl p-6"
        title={
          <div className="flex justify-between items-center">
            <span>Nhập kho hàng loạt xe điện</span>
            <div className="flex gap-2">
              {role === "EVM_STAFF" && (
                <Button
                  onClick={openForecast}
                  loading={triggering || loadingForecast}
                  className="rounded-lg border-gray-300"
                  icon={<ExperimentOutlined />}
                >
                  Dự báo AI
                </Button>
              )}
              <Button
                onClick={() => navigate(-1)}
                className="rounded-lg border-gray-300"
              >
                Quay lại
              </Button>
            </div>
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

      {/* ======= Modal Dự báo AI ======= */}
      <Modal
        open={forecastOpen}
        onCancel={() => setForecastOpen(false)}
        footer={null}
        width={880}
        title={
          <div className="flex items-center justify-between pr-2">
            <span>🔮 Dự báo nhu cầu (AI)</span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={loadingForecast}
              className="rounded-md"
            >
              Làm mới
            </Button>
          </div>
        }
        destroyOnClose
      >
        {loadingForecast ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : filteredForThisModel.length === 0 ? (
          <Empty description="Chưa có dự báo phù hợp cho mẫu xe này." />
        ) : (
          <Table<NormalizedForecast>
            rowKey={(r, i) => r.vehicleId || r.modelId || String(i)}
            dataSource={filteredForThisModel}
            pagination={{ pageSize: 5 }}
            size="middle"
            columns={[
              {
                title: "Số lượng",
                dataIndex: "quantity",
                align: "center",
                render: (v?: number) => (typeof v === "number" ? v : "—"),
              },
              {
                title: "Màu",
                dataIndex: "color",
                align: "center",
                render: (v?: string) => v ?? "—",
              },
              {
                title: "Năm SX",
                dataIndex: "productionYear",
                align: "center",
                render: (v?: number) => (v ? v : "—"),
              },
              {
                title: "Trạng thái",
                dataIndex: "status",
                align: "center",
                render: (s?: string) => (s ? <Tag>{s}</Tag> : "—"),
              },
              {
                title: "Độ tin cậy",
                dataIndex: "confidence",
                align: "center",
                render: (c?: number) =>
                  typeof c === "number" ? `${Math.round(c * 100)}%` : "—",
              },
              {
                title: "Ghi chú",
                dataIndex: "note",
                ellipsis: true,
                render: (v?: string) =>
                  v ? <Tooltip title={v}>{v}</Tooltip> : "—",
              },
              {
                title: "Thao tác",
                key: "action",
                align: "center",
                render: (_: unknown, r) => (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    className="!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] rounded-md"
                    onClick={() => {
                      const patch: Record<string, unknown> = {};
                      if (typeof r.quantity === "number" && r.quantity > 0)
                        patch.quantity = r.quantity;
                      if (typeof r.color === "string") patch.color = r.color;
                      if (
                        typeof r.productionYear === "number" &&
                        r.productionYear > 1900
                      ) {
                        patch.productionYear = dayjs(
                          `${r.productionYear}-01-01`
                        );
                      }
                      if (r.status) patch.status = r.status;

                      if (Object.keys(patch).length === 0) {
                        toast.info(
                          "Dự báo không có trường phù hợp để áp dụng vào form."
                        );
                        return;
                      }
                      form.setFieldsValue(patch);
                      toast.success("Đã áp dụng dự báo vào form.");
                      setForecastOpen(false);
                    }}
                  >
                    Áp dụng vào form
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default VehicleBulkPage;
