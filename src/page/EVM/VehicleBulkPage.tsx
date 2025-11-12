// src/page/vehicle/VehicleBulkPage.tsx
import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Form,
  InputNumber,
  Input,
  DatePicker,
  Select,
  Skeleton,
  Image,
  Space,
  Alert,
  Modal,
  Table,
  Empty,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useGetVehicleById,
  useCreateVehicleUnitsBulk,
} from "../../service/vehicleService";
import { ROUTES } from "../../model/routePaths";
import { useCurrentUser } from "../../utils/getCurrentUser";
import api from "../../config/api";
import { toast } from "react-toastify";
import {
  ReloadOutlined,
  ExperimentOutlined,
  CheckOutlined,
} from "@ant-design/icons";
// ⭐ Button wrapper của dự án
import { Button } from "../../components/atoms/Button";

const { Option } = Select;

// ================== Form types ==================
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

// ================== API types ==================
type ApiColorForecast = {
  color: string;
  predictedColorDemand: number;
};

type ApiSupplyPlan = {
  modelName: string;
  predictedDealerDemand?: number;
  recommendedProduction?: number;
  colorForecast?: ApiColorForecast[];
};

type ApiForecastRoot = {
  country?: string;
  region?: string;
  supplyPlan?: ApiSupplyPlan[];
};

// ================== Utils ==================
const normalize = (s?: string) =>
  (s || "").toLowerCase().trim().replace(/\s+/g, " ");

const fmt = (n?: number) =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("vi-VN") : "—";

const topColorOf = (colors?: ApiColorForecast[]) => {
  if (!Array.isArray(colors) || colors.length === 0) return undefined;
  return [...colors].sort(
    (a, b) => (b.predictedColorDemand ?? 0) - (a.predictedColorDemand ?? 0)
  )[0];
};

const BASE_URL = "/vehicle";

// =================================================
export const VehicleBulkPage = () => {
  const [form] = Form.useForm<FormValues>();
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

  // ========== Dự báo AI ==========
  const [forecastOpen, setForecastOpen] = useState<boolean>(false);
  const [triggering, setTriggering] = useState<boolean>(false);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);
  const [forecastRaw, setForecastRaw] = useState<ApiForecastRoot[]>([]);

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

  // Gọi API kích hoạt và lấy kết quả dự báo
  const triggerForecast = async () => {
    try {
      setTriggering(true);
      await api.get(`${BASE_URL}/demandForecastFromAI`);
    } catch {
      // Backend có thể chạy async — vẫn tiếp tục fetch danh sách
    } finally {
      setTriggering(false);
    }
  };

  const loadForecasts = async () => {
    setLoadingForecast(true);
    try {
      const res = await api.get(`${BASE_URL}/createDemandForecasts`);
      const data = res?.data;
      const list: ApiForecastRoot[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.result)
        ? data.result
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setForecastRaw(list);
    } catch {
      toast.error("Không thể tải dự báo AI.");
      setForecastRaw([]);
    } finally {
      setLoadingForecast(false);
    }
  };

  const openForecast = async () => {
    setForecastOpen(true);
    await triggerForecast();
    await loadForecasts();
  };

  const handleRefresh = async () => {
    await triggerForecast();
    await loadForecasts();
  };

  // Lọc đúng model hiện tại từ supplyPlan của từng (country, region)
  type Row = {
    key: string;
    country?: string;
    region?: string;
    modelName: string;
    predictedDealerDemand?: number;
    recommendedProduction?: number;
    topColor?: string;
    topColorDemand?: number;
    allColors?: ApiColorForecast[];
  };

  const modelRows: Row[] = useMemo(() => {
    const currentModel = normalize(
      (vehicleInfo?.model as string | undefined) ||
        (vehicleInfo?.name as string | undefined)
    );

    if (!currentModel) return [];

    const rows: Row[] = [];
    for (const bucket of forecastRaw || []) {
      const plans = Array.isArray(bucket?.supplyPlan) ? bucket.supplyPlan : [];
      for (const p of plans) {
        if (normalize(p?.modelName) !== currentModel) continue;
        const top = topColorOf(p.colorForecast);
        rows.push({
          key: `${bucket.region || bucket.country || "x"}-${p.modelName}`,
          country: bucket.country,
          region: bucket.region,
          modelName: p.modelName,
          predictedDealerDemand: p.predictedDealerDemand,
          recommendedProduction: p.recommendedProduction,
          topColor: top?.color,
          topColorDemand: top?.predictedColorDemand,
          allColors: p.colorForecast || [],
        });
      }
    }
    return rows;
  }, [forecastRaw, vehicleInfo]);

  // ========== SUBMIT ==========
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
        {
          replace: true,
          state: {
            from: "bulk",
            backTo: `${basePath}/${ROUTES.EVM_VEHICLE}`, // hoặc ROUTES.EVM_VEHICLE_LIST nếu bạn dùng tên này
          },
        }
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

  // ===== Bảng dự báo (chỉ hiện trong Modal) =====
  const colorColumns: ColumnsType<ApiColorForecast> = [
    {
      title: "Màu",
      dataIndex: "color",
      key: "color",
      render: (v) => v || "—",
    },
    {
      title: "Nhu cầu dự báo",
      dataIndex: "predictedColorDemand",
      key: "predictedColorDemand",
      align: "right",
      render: (v: number) => fmt(v),
    },
    {
      title: "Thao tác",
      key: "pick",
      align: "center",
      render: (_: unknown, c) => (
        <Button
          size="small"
          onClick={() => {
            if (c?.color) {
              form.setFieldValue("color", c.color);
              toast.success(`Đã chọn màu ${c.color} vào form.`);
            }
          }}
        >
          Chọn màu này
        </Button>
      ),
    },
  ];

  const columns: ColumnsType<Row> = [
    {
      title: "Khu vực",
      key: "region",
      width: 200,
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.region || "—"}</span>
          <span className="text-xs text-gray-500">
            {r.country ? `Quốc gia: ${r.country}` : ""}
          </span>
        </div>
      ),
    },
    {
      title: "Model",
      dataIndex: "modelName",
      key: "modelName",
    },
    {
      title: "Demand (Dealer)",
      dataIndex: "predictedDealerDemand",
      key: "predictedDealerDemand",
      align: "right",
      render: (v: number) =>
        typeof v === "number" ? <Tag color="blue">{fmt(v)}</Tag> : "—",
    },
    {
      title: "Recommended Production",
      dataIndex: "recommendedProduction",
      key: "recommendedProduction",
      align: "right",
      render: (v: number) =>
        typeof v === "number" ? <Tag color="green">{fmt(v)}</Tag> : "—",
    },
    {
      title: "Top Color",
      key: "topColor",
      align: "center",
      render: (_, r) =>
        r.topColor ? (
          <div className="flex flex-col items-center">
            <Tag color="purple">{r.topColor}</Tag>
            <span className="text-xs text-gray-500">
              Nhu cầu: {fmt(r.topColorDemand)}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        ),
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
            const q =
              typeof r.recommendedProduction === "number" &&
              r.recommendedProduction > 0
                ? r.recommendedProduction
                : typeof r.predictedDealerDemand === "number" &&
                  r.predictedDealerDemand > 0
                ? r.predictedDealerDemand
                : undefined;

            const patch: Partial<FormValues> = {};
            if (typeof q === "number") patch.quantity = q;
            if (r.topColor) patch.color = r.topColor;

            if (Object.keys(patch).length === 0) {
              toast.info(
                "Dự báo không có trường phù hợp (quantity/color) để áp dụng."
              );
              return;
            }

            form.setFieldsValue(patch as FormValues);
            toast.success("Đã áp dụng dự báo vào form thêm lô.");
            setForecastOpen(false);
          }}
        >
          Áp dụng vào form
        </Button>
      ),
    },
  ];

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
                  type="default"
                >
                  Dự báo AI
                </Button>
              )}
              <Button
                onClick={() => navigate(-1)}
                className="rounded-lg border-gray-300"
                type="default"
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
                  message="Giá đơn vị sẽ do hệ thống tính: Giá bán lẻ * hệ số (loại mẫu xe)"
                />
              </div>
            </div>

            {/* FORM NHẬP LÔ */}
            <div className="flex-1">
              <Form<FormValues>
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
                    label="Giá dự kiến (giá bán lẻ x hệ số)"
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

      {/* ===== Modal Dự báo AI ===== */}
      <Modal
        open={forecastOpen}
        onCancel={() => setForecastOpen(false)}
        footer={null}
        width={920}
        destroyOnClose
        title={
          <div className="flex items-center gap-3 pr-16">
            <span>🔮 Dự báo nhu cầu (AI)</span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loadingForecast || triggering}
              className="rounded-md"
              type="default"
            >
              Làm mới
            </Button>
          </div>
        }
      >
        {loadingForecast ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : modelRows.length === 0 ? (
          <div className="py-10">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có dự báo phù hợp cho model này."
            />
          </div>
        ) : (
          <Table<Row>
            rowKey="key"
            dataSource={modelRows}
            columns={columns}
            pagination={false}
            expandable={{
              expandedRowRender: (r) =>
                Array.isArray(r.allColors) && r.allColors.length > 0 ? (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-2">Phân rã theo màu</div>
                    <Table<ApiColorForecast>
                      size="small"
                      rowKey={(c) => `${r.key}-${c.color}`}
                      dataSource={r.allColors}
                      columns={colorColumns}
                      pagination={false}
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 px-4 py-2">
                    Không có dữ liệu màu.
                  </div>
                ),
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default VehicleBulkPage;
