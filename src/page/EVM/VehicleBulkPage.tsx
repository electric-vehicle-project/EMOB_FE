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
  Empty,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useGetVehicleById,
  useCreateVehicleUnitsBulk,
  useGetAIDemandForecast,
} from "../../service/vehicleService";
import { ROUTES } from "../../model/routePaths";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { toast } from "react-toastify";
import { ReloadOutlined, CheckOutlined } from "@ant-design/icons";
import { Button } from "../../components/atoms/Button";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";

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

type ApiForecastItem = {
  modelName: string;
  predictedDealerDemand?: number;
  recommendedProduction?: number;
  colorForecast?: ApiColorForecast[];
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
  const [isLoadingMultiplier, setIsLoadingMultiplier] =
    useState<boolean>(false);

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
  const demandForecast = useGetAIDemandForecast();

  const [forecastOpen, setForecastOpen] = useState<boolean>(false);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);
  const [forecastRaw, setForecastRaw] = useState<ApiForecastItem[]>([]);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const fetchMultiplier = async (status: FormValues["status"]) => {
    setIsLoadingMultiplier(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/vehicle-price-rules/${status}`
      ).then((r) => r.json());
      const newMultiplier = res?.result?.multiplier;
      setMultiplier(typeof newMultiplier === "number" ? newMultiplier : 1);
    } catch {
      setMultiplier(1);
      toast.error("Không thể lấy hệ số giá từ price rule.");
    } finally {
      setIsLoadingMultiplier(false);
    }
  };

  const handleStatusChange = async (status: FormValues["status"]) => {
    fetchMultiplier(status);
  };

  // ================= Lấy forecast từ BE =================
  const loadForecasts = async () => {
    setLoadingForecast(true);
    try {
      const res = await demandForecast.refetch(vehicleInfo?.model);
      const raw: unknown = res;

      let list: ApiForecastItem[] = [];

      if (Array.isArray(raw)) {
        list = raw as ApiForecastItem[];
      } else if (
        raw &&
        typeof raw === "object" &&
        Array.isArray((raw as { result?: unknown }).result)
      ) {
        list = ((raw as { result?: unknown }).result ??
          []) as ApiForecastItem[];
      } else if (
        raw &&
        typeof raw === "object" &&
        Array.isArray((raw as { data?: unknown }).data)
      ) {
        list = ((raw as { data?: unknown }).data ?? []) as ApiForecastItem[];
      }

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
    await loadForecasts();
  };

  const handleRefresh = async () => {
    await loadForecasts();
  };

  // ================= Chuẩn hóa dữ liệu forecast theo model =================
  type Row = {
    key: string;
    modelName: string;
    predictedDealerDemand?: number;
    recommendedProduction?: number;
    topColor?: string;
    topColorDemand?: number;
    allColors?: ApiColorForecast[];
  };

  const modelRows: Row[] = useMemo(() => {
    const currentModel = normalize(vehicleInfo?.model);
    if (!currentModel) return [];

    const rows: Row[] = [];
    for (const item of forecastRaw || []) {
      if (normalize(item.modelName) !== currentModel) continue;

      const top = topColorOf(item.colorForecast);
      rows.push({
        key: `${item.modelName}`,
        modelName: item.modelName,
        predictedDealerDemand: item.predictedDealerDemand,
        recommendedProduction: item.recommendedProduction,
        topColor: top?.color,
        topColorDemand: top?.predictedColorDemand,
        allColors: item.colorForecast || [],
      });
    }
    return rows;
  }, [forecastRaw, vehicleInfo]);

  const best = useMemo(
    () => (modelRows.length > 0 ? modelRows[0] : undefined),
    [modelRows]
  );

  const topColor = best?.topColor;
  const topColorDemand = best?.topColorDemand;
  const recommended = best?.recommendedProduction;
  const predicted = best?.predictedDealerDemand;

  // ================= Submit + Hủy =================
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
        `Nhập ${values.quantity} xe (${
          values.status
        }) thành công — Giá/xe: ${previewPrice.toLocaleString("vi-VN")}₫`
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
      toast.error("Không thể nhập đơn vị xe. Vui lòng thử lại.");
    }
  };

  const handleCancelBulk = () => {
    if (!form.isFieldsTouched()) {
      navigate(-1);
      return;
    }
    setCancelConfirmOpen(true);
  };

  const imageList: string[] = Array.isArray(vehicleInfo?.images)
    ? vehicleInfo.images.filter((u: string) => !!u && /^https?:\/\//i.test(u))
    : [];

  const mainImage =
    imageList[0] || "https://placehold.co/400x300?text=No+Image";

  useEffect(() => {
    if (!vehicleId) {
      toast.error("Thiếu vehicleId.");
      navigate(-1);
    }
  }, [vehicleId, navigate]);

  useEffect(() => {
    fetchMultiplier("NORMAL");
  }, []);

  return (
    <div className="flex justify-center min-h-[90vh] bg-gray-50 py-10 px-4">
      <Card
        bordered={false}
        className="w-full max-w-5xl shadow-sm rounded-2xl border border-gray-100 overflow-hidden bg-white"
        headStyle={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb" }}
        bodyStyle={{ padding: 20 }}
        title={
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#414d38]">
                Nhập kho hàng loạt xe điện
              </span>
              {vehicleInfo && (
                <span className="text-xs text-gray-500">
                  {vehicleInfo.brand} · {vehicleInfo.model} ·{" "}
                  {vehicleInfo.type ?? "EV"}
                </span>
              )}
            </div>
            {role === "EVM_STAFF" && (
              <button
                onClick={openForecast}
                disabled={!vehicleInfo || loadingForecast}
                className="
      relative overflow-hidden
      flex items-center gap-2
      px-7 py-2 rounded-full text-xs font-semibold tracking-wide
      text-[#2e4b32]
      transition-all duration-300
      active:scale-[0.94]
      hover:scale-[1.06] 
      bg-white
    "
              >
                {/* VIỀN ĐIỆN XANH EMOB */}
                <span
                  className="
        absolute inset-0 rounded-full p-[2px]
        bg-gradient-to-r from-[#7bc47f] via-[#40c463] to-[#7bc47f]
        animate-electric-border-green
        opacity-95
        z-0
      "
                >
                  <span className="block w-full h-full rounded-full bg-white" />
                </span>

                {/* AURA GLOW XANH TO & RÕ */}
                <span
                  className="
        absolute inset-0 rounded-full
        bg-green-300/40 blur-2xl
        animate-electric-aura-green
        z-0
      "
                />

                {/* ICON + TEXT */}
                <span className="relative z-10 text-base">🌿</span>
                <span className="relative z-10">Dự báo AI</span>
              </button>
            )}
          </div>
        }
      >
        {vehicleLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : vehicleInfo ? (
          <>
            <div className="flex flex-col lg:flex-row gap-10">
              {/* ẢNH + INFO */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-md rounded-2xl overflow-hidden bg-gradient-to-b from-[#f5f7f0] to-white border">
                  {/* ==== PREVIEW MAIN IMAGE ONLY ==== */}
                  <Image.PreviewGroup
                    items={[mainImage]}
                    preview={{
                      visible: previewOpen,
                      current: 0,
                      onVisibleChange: (v) => setPreviewOpen(v),
                      onChange: () => {},
                      toolbarRender: (_node, info) => {
                        const { icons, actions } = info;
                        const { zoomInIcon, zoomOutIcon, prevIcon, nextIcon } =
                          icons;
                        const { onZoomIn, onZoomOut, onActive } = actions;

                        return (
                          <div className="ant-image-preview-operations">
                            {/* Prev (nếu có nhiều ảnh sẽ hoạt động, còn 1 ảnh thì ẩn) */}
                            {prevIcon && (
                              <div
                                className="ant-image-preview-operations-operation"
                                onClick={() => onActive?.(-1)}
                              >
                                {prevIcon}
                              </div>
                            )}

                            {/* Next */}
                            {nextIcon && (
                              <div
                                className="ant-image-preview-operations-operation"
                                onClick={() => onActive?.(1)}
                              >
                                {nextIcon}
                              </div>
                            )}

                            {/* Zoom In */}
                            <div
                              className="ant-image-preview-operations-operation"
                              onClick={onZoomIn}
                            >
                              {zoomInIcon}
                            </div>

                            {/* Zoom Out */}
                            <div
                              className="ant-image-preview-operations-operation"
                              onClick={onZoomOut}
                            >
                              {zoomOutIcon}
                            </div>
                          </div>
                        );
                      },
                    }}
                  >
                    <div
                      className="group w-full max-w-md rounded-2xl overflow-hidden bg-gradient-to-b from-[#f5f7f0] to-white border cursor-zoom-in relative"
                      onClick={() => setPreviewOpen(true)}
                    >
                      <img
                        src={mainImage}
                        alt="vehicle"
                        className="object-contain w-full h-[260px] transition-transform duration-300 group-hover:scale-105 bg-white"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/vehicle-placeholder.png";
                        }}
                      />

                      <div className="absolute bottom-2 right-2 hidden group-hover:flex items-center gap-1 rounded-md bg-black/50 text-white text-xs px-2 py-1 pointer-events-none">
                        Nhấn để phóng to
                      </div>
                    </div>
                  </Image.PreviewGroup>
                </div>

                <div className="mt-4 text-center space-y-1">
                  <h3 className="text-xl font-semibold text-[#414d38]">
                    {vehicleInfo.brand} – {vehicleInfo.model}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Loại: {vehicleInfo.type} · Pin:{" "}
                    {vehicleInfo.batteryKwh?.toLocaleString("vi-VN") ?? "—"} kWh
                    · Tầm: {vehicleInfo.rangeKm?.toLocaleString("vi-VN") ?? "—"}{" "}
                    km
                  </p>
                  <p className="text-gray-700 text-sm">
                    Giá bán lẻ:{" "}
                    <span className="text-[#627254] font-semibold">
                      {typeof vehicleInfo.retailPrice === "number"
                        ? `${vehicleInfo.retailPrice.toLocaleString("vi-VN")}₫`
                        : "—"}
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
                  <Space className="w-full" size="middle" direction="vertical">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Form.Item
                        label="Số lượng nhập kho"
                        name="quantity"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng.",
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          className="w-full"
                          placeholder="Nhập số lượng xe"
                        />
                      </Form.Item>

                      <Form.Item label="Giá dự kiến / xe">
                        <div className="flex items-center gap-2">
                          <InputNumber
                            value={previewPrice}
                            disabled
                            className="w-full"
                            formatter={(v) =>
                              `${Number(v || 0).toLocaleString("vi-VN")}`
                            }
                            addonAfter="₫"
                          />
                          {isLoadingMultiplier && (
                            <ReloadOutlined className="animate-spin text-gray-400" />
                          )}
                        </div>
                      </Form.Item>
                    </div>

                    <Form.Item
                      label="Màu sơn"
                      name="color"
                      rules={[
                        { required: true, message: "Vui lòng nhập màu sơn." },
                      ]}
                    >
                      <Input placeholder="Ví dụ: Trắng ngọc trai, Đen, Xanh lá" />
                    </Form.Item>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Form.Item
                        label="Năm sản xuất"
                        name="productionYear"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn năm sản xuất.",
                          },
                        ]}
                      >
                        <DatePicker
                          picker="year"
                          className="w-full"
                          placeholder="Chọn năm"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Tình trạng lô xe"
                        name="status"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn tình trạng.",
                          },
                        ]}
                      >
                        <Select onChange={handleStatusChange}>
                          <Option value="NORMAL">Xe mới</Option>
                          <Option value="SPECIAL">
                            Xe đặc biệt / trưng bày
                          </Option>
                          <Option value="OLD_STOCK">Xe tồn kho</Option>
                          <Option value="TEST_DRIVE">Xe lái thử</Option>
                          <Option value="RESERVED">Xe giữ chỗ</Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isPending}
                      block
                      className="!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] mt-3 rounded-md"
                    >
                      Nhập kho
                    </Button>

                    <Button
                      type="default"
                      block
                      className="mt-2 rounded-md border border-gray-300"
                      onClick={handleCancelBulk}
                    >
                      Hủy nhập kho
                    </Button>
                  </Space>
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

      {/* MODAL AI Forecast - giao diện bong bóng chat */}
      <Modal
        open={forecastOpen}
        onCancel={() => setForecastOpen(false)}
        footer={null}
        width={920}
        destroyOnClose
        title={
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#414d38]">
              🔮 Dự báo nhu cầu nhập kho
            </span>
            <span className="text-xs text-gray-500">
              Dựa trên dữ liệu 3 tháng gần nhất
            </span>
          </div>
        }
      >
        {loadingForecast ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !best ? (
          <Empty
            description={
              vehicleInfo?.model
                ? `Không có dự báo phù hợp cho model ${vehicleInfo.model}.`
                : "Không có dự báo phù hợp cho model này."
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Thanh hành động phía trên, tránh trùng nút X */}
            <div className="flex justify-end mb-2">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loadingForecast}
                className="rounded-full border border-gray-200"
              >
                Làm mới dự báo
              </Button>
            </div>

            {/* Bong bóng chat AI */}
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border">
                <img
                  src="/AI_avatar.png"
                  alt="AI Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="max-w-[640px] rounded-2xl bg-gray-100 px-4 py-3 shadow-sm">
                <p className="mt-1 text-sm text-gray-700">
                  Dự báo cho tháng tiếp theo:{" "}
                  {typeof topColorDemand === "number" ? (
                    <>
                      nhu cầu ước tính khoảng <b>{fmt(topColorDemand)} xe</b>{" "}
                      cho {topColor ? <b>màu {topColor}</b> : "màu ưu tiên"}.
                    </>
                  ) : (
                    "hệ thống chưa có đủ dữ liệu chi tiết theo màu."
                  )}
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  Hệ thống đề xuất nhập khoảng{" "}
                  {typeof recommended === "number" ? (
                    <b>{fmt(recommended)} xe</b>
                  ) : typeof predicted === "number" ? (
                    <b>{fmt(predicted)} xe</b>
                  ) : (
                    "một số lượng phù hợp"
                  )}{" "}
                  để đáp ứng nhu cầu dự kiến trong tháng tới.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    className="!bg-[#627254] !border-[#627254] rounded-full px-4"
                    onClick={() => {
                      const q =
                        typeof recommended === "number"
                          ? recommended
                          : predicted;

                      const patch: Partial<FormValues> = {};
                      if (typeof q === "number") patch.quantity = q;
                      if (topColor) patch.color = topColor;

                      form.setFieldsValue(patch as FormValues);
                      toast.success("Đã áp dụng dự báo vào form.");
                      setForecastOpen(false);
                    }}
                  >
                    Áp dụng vào form
                  </Button>

                  <Button
                    onClick={() => setForecastOpen(false)}
                    className="rounded-full px-4"
                  >
                    Tự nhập thủ công
                  </Button>
                </div>
              </div>
            </div>

            {/* Thẻ tóm tắt số liệu */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card size="small" className="border border-gray-200">
                <p className="text-xs text-gray-500">Nhu cầu đại lý dự báo</p>
                <p className="mt-1 text-lg font-semibold">
                  {typeof predicted === "number" ? `${fmt(predicted)} xe` : "—"}
                </p>
              </Card>

              <Card size="small" className="border border-gray-200">
                <p className="text-xs text-gray-500">Sản lượng khuyến nghị</p>
                <p className="mt-1 text-lg font-semibold">
                  {typeof recommended === "number"
                    ? `${fmt(recommended)} xe`
                    : "—"}
                </p>
              </Card>

              <Card size="small" className="border border-gray-200">
                <p className="text-xs text-gray-500">Màu ưu tiên</p>
                <p className="mt-1 text-lg font-semibold">{topColor ?? "—"}</p>
              </Card>

              <Card size="small" className="border border-gray-200">
                <p className="text-xs text-gray-500">
                  Nhu cầu màu ưu tiên (ước tính)
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {typeof topColorDemand === "number"
                    ? `${fmt(topColorDemand)} xe`
                    : "—"}
                </p>
              </Card>
            </div>
          </div>
        )}
      </Modal>

      <DeleteConfirm
        open={cancelConfirmOpen}
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          setCancelConfirmOpen(false);
          navigate(-1);
        }}
        title="Hủy nhập lô xe?"
        message="Các thông tin đã nhập sẽ bị mất. Bạn có chắc chắn muốn hủy?"
        okText="Hủy nhập"
        danger
      />
    </div>
  );
};

export default VehicleBulkPage;
