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
  useGetAIDemandForecast,
  useCreateAIDemandForecasts,
} from "../../service/vehicleService";
import { ROUTES } from "../../model/routePaths";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { toast } from "react-toastify";
import {
  ReloadOutlined,
  ExperimentOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { Button } from "../../components/atoms/Button";

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

  // ================= AI Forecast Hooks =================
  const demandForecast = useGetAIDemandForecast(vehicleId ?? "");
  const createForecast = useCreateAIDemandForecasts(vehicleId ?? "");

  const [forecastOpen, setForecastOpen] = useState<boolean>(false);
  const [triggering, setTriggering] = useState<boolean>(false);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);
  const [forecastRaw, setForecastRaw] = useState<ApiForecastRoot[]>([]);

  const fetchMultiplier = async (status: FormValues["status"]) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/vehicle-price-rules/${status}`
      ).then((r) => r.json());
      const newMultiplier = res?.result?.multiplier;
      setMultiplier(typeof newMultiplier === "number" ? newMultiplier : 1);
    } catch {
      setMultiplier(1);
      toast.error("Không thể lấy multiplier của price rule!");
    }
  };

  const handleStatusChange = async (status: FormValues["status"]) => {
    fetchMultiplier(status);
  };

  // ================= Replace axios.get() =================

  const triggerForecast = async () => {
    setTriggering(true);
    try {
      await demandForecast.refetch();
    } finally {
      setTriggering(false);
    }
  };

  const loadForecasts = async () => {
    setLoadingForecast(true);
    try {
      const res = await createForecast.refetch();
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

  // ================= Rows =================
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

  // ================= Submit =================
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
        }) thành công — Giá/xe: ${previewPrice.toLocaleString()}₫`
      );

      navigate(
        `${basePath}/${ROUTES.EVM_VEHICLE_DETAIL}`.replace(":id", vehicleId),
        {
          replace: true,
          state: {
            from: "bulk",
            backTo: `${basePath}/${ROUTES.EVM_VEHICLE}`,
          },
        }
      );
    } catch {
      toast.error("Không thể nhập đơn vị xe. Vui lòng thử lại!");
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

  useEffect(() => {
    fetchMultiplier("NORMAL");
  }, []);

  const colorColumns: ColumnsType<ApiColorForecast> = [
    {
      title: "Màu",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Nhu cầu",
      dataIndex: "predictedColorDemand",
      align: "right",
      render: (v) => fmt(v),
    },
    {
      title: "Chọn",
      key: "pick",
      align: "center",
      render: (_, c) => (
        <Button
          size="small"
          onClick={() => {
            form.setFieldValue("color", c.color);
            toast.success(`Đã chọn màu ${c.color}`);
          }}
        >
          Chọn
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
    },
    {
      title: "Demand",
      dataIndex: "predictedDealerDemand",
      align: "right",
      render: (v) =>
        typeof v === "number" ? <Tag color="blue">{fmt(v)}</Tag> : "—",
    },
    {
      title: "Production",
      dataIndex: "recommendedProduction",
      align: "right",
      render: (v) =>
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
          "—"
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, r) => (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          className="!bg-[#627254] !border-[#627254]"
          onClick={() => {
            const q =
              typeof r.recommendedProduction === "number"
                ? r.recommendedProduction
                : r.predictedDealerDemand;

            const patch: Partial<FormValues> = {};
            if (typeof q === "number") patch.quantity = q;
            if (r.topColor) patch.color = r.topColor;

            form.setFieldsValue(patch as FormValues);
            toast.success("Đã áp dụng dự báo vào form.");
            setForecastOpen(false);
          }}
        >
          Áp dụng
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
                  icon={<ExperimentOutlined />}
                  type="default"
                >
                  Dự báo AI
                </Button>
              )}
              <Button onClick={() => navigate(-1)} type="default">
                Quay lại
              </Button>
            </div>
          </div>
        }
      >
        {vehicleLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : vehicleInfo ? (
          <>
            {/* ẢNH */}
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 flex flex-col items-center">
                <Image
                  src={mainImage}
                  alt="vehicle"
                  width={420}
                  height={300}
                  className="rounded-lg shadow-sm border object-cover"
                />
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-[#627254]">
                    {vehicleInfo.brand} – {vehicleInfo.model}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Loại: {vehicleInfo.type} | Pin: {vehicleInfo.batteryKwh} kWh
                    | Tầm: {vehicleInfo.rangeKm} km
                  </p>
                  <p className="text-gray-700 font-medium mt-2">
                    Giá bán lẻ:{" "}
                    <span className="text-[#627254]">
                      {vehicleInfo.retailPrice?.toLocaleString() ?? "—"}₫
                    </span>
                  </p>
                </div>
              </div>

              {/* FORM */}
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
                >
                  <Space className="w-full" size="middle">
                    <Form.Item
                      label="Số lượng"
                      name="quantity"
                      className="flex-1"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <Form.Item label="Giá dự kiến" className="flex-1">
                      <InputNumber
                        value={previewPrice}
                        readOnly
                        className="w-full"
                        formatter={(v) => `${Number(v || 0).toLocaleString()}`}
                      />
                    </Form.Item>
                  </Space>

                  <Form.Item
                    label="Màu sơn"
                    name="color"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Năm sản xuất"
                    name="productionYear"
                    rules={[{ required: true }]}
                  >
                    <DatePicker picker="year" className="w-full" />
                  </Form.Item>

                  <Form.Item
                    label="Tình trạng"
                    name="status"
                    rules={[{ required: true }]}
                  >
                    <Select onChange={handleStatusChange}>
                      <Option value="NORMAL">Xe mới</Option>
                      <Option value="SPECIAL">Xe đặc biệt</Option>
                      <Option value="OLD_STOCK">Xe tồn kho</Option>
                      <Option value="TEST_DRIVE">Lái thử</Option>
                      <Option value="RESERVED">Giữ chỗ</Option>
                    </Select>
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    block
                    className="bg-[#627254] text-white mt-6"
                  >
                    Nhập kho
                  </Button>
                </Form>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400">
            Không tìm thấy thông tin xe.
          </p>
        )}
      </Card>

      {/* MODAL */}
      <Modal
        open={forecastOpen}
        onCancel={() => setForecastOpen(false)}
        footer={null}
        width={920}
        destroyOnClose
        title={
          <div className="flex items-center gap-3">
            <span>🔮 Dự báo (AI)</span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loadingForecast || triggering}
            >
              Làm mới
            </Button>
          </div>
        }
      >
        {loadingForecast ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : modelRows.length === 0 ? (
          <Empty description="Không có dự báo phù hợp cho model này." />
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
                    <div className="font-medium mb-2">Theo màu</div>
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
