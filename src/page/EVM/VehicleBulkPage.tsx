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
import { useNavigate } from "react-router-dom";
import {
  useGetVehicleById,
  useCreateVehicleUnitsBulk,
  useGetAIDemandForecast,
} from "../../service/vehicleService";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { toast } from "react-toastify";
import { ReloadOutlined, CheckOutlined } from "@ant-design/icons";
import { Button } from "../../components/atoms/Button";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";
import api from "../../config/api";

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

type MultiplierApiResponse = {
  result?: {
    multiplier?: number;
  };
};

type ColorSuggestion = {
  color: string;
  quantity: number;
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

type VehicleBulkPageProps = {
  onClose?: () => void;
  open: boolean;
  vehicleId?: string;
};

export const VehicleBulkPage = ({
  onClose,
  open,
  vehicleId,
}: VehicleBulkPageProps) => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role ?? "EVM_STAFF";

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

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [applyingFromAi, setApplyingFromAi] = useState(false);
  const [applyingColor, setApplyingColor] = useState<string | null>(null);

  const fetchMultiplier = async (status: FormValues["status"]) => {
    setIsLoadingMultiplier(true);
    try {
      const res = await api.get<MultiplierApiResponse>(
        `/vehicle-price-rules/${status}`
      );
      const newMultiplier = res.data.result?.multiplier;
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
    setSelectedColors([]);
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

  const colorSuggestions: ColorSuggestion[] = useMemo(() => {
    if (!best?.allColors || best.allColors.length === 0) return [];
    const list: ColorSuggestion[] = best.allColors.map((c) => ({
      color: c.color,
      quantity:
        typeof c.predictedColorDemand === "number"
          ? Math.round(c.predictedColorDemand)
          : 0,
    }));
    return list.sort((a, b) => b.quantity - a.quantity);
  }, [best]);

  const positiveSuggestions = useMemo(
    () => colorSuggestions.filter((s) => s.quantity > 0),
    [colorSuggestions]
  );

  const selectedSuggestionList = useMemo(
    () => positiveSuggestions.filter((s) => selectedColors.includes(s.color)),
    [positiveSuggestions, selectedColors]
  );

  const hasAnyPositive = positiveSuggestions.length > 0;
  const hasSelectedPositive = selectedSuggestionList.length > 0;

  const toggleSelectColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const createBatchesFromSuggestions = async (targets: ColorSuggestion[]) => {
    if (!vehicleId) {
      toast.error("Thiếu vehicleId. Vui lòng quay lại.");
      return;
    }
    const effectiveTargets = targets.filter((s) => s.quantity > 0);
    if (!effectiveTargets.length) return;

    setApplyingFromAi(true);
    try {
      let totalCreated = 0;
      for (const s of effectiveTargets) {
        setApplyingColor(s.color);
        await bulkCreate({
          vehicleId,
          quantity: s.quantity,
          color: s.color,
          productionYear: dayjs().format("YYYY-01-01"),
          status: "NORMAL",
        });
        totalCreated += s.quantity;
      }
      if (totalCreated > 0) {
        toast.success(
          `Đã nhập tổng cộng ${totalCreated.toLocaleString(
            "vi-VN"
          )} xe theo gợi ý AI.`
        );
        setForecastOpen(false);
        onClose?.();
      }
    } catch {
      toast.error("Không thể nhập lô theo gợi ý. Vui lòng thử lại.");
    } finally {
      setApplyingFromAi(false);
      setApplyingColor(null);
    }
  };

  const handleApplySingleSuggestion = async (s: ColorSuggestion) => {
    await createBatchesFromSuggestions([s]);
  };

  const handleApplySelectedSuggestions = async () => {
    if (!hasSelectedPositive) return;
    await createBatchesFromSuggestions(selectedSuggestionList);
  };

  const handleApplyAllSuggestions = async () => {
    if (!hasAnyPositive) return;
    await createBatchesFromSuggestions(positiveSuggestions);
  };

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

      onClose?.();
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
    fetchMultiplier("NORMAL");
  }, []);

  return (
    <Modal open={open} footer={null} width={800} onCancel={onClose}>
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
              <div className="relative p-1">
                <button
                  onClick={openForecast}
                  disabled={!vehicleInfo || loadingForecast}
                  className="
                  relative overflow-visible
                  flex items-center gap-2
                  px-7 py-2 rounded-full text-xs font-semibold tracking-wide
                  text-[#2e4b32]
                  transition-all duration-300
                  active:scale-[0.95]
                  hover:scale-[1.06]
                  bg-white
                "
                >
                  <span className="ai-border-static z-0">
                    <span className="block w-full h-full rounded-full bg-white"></span>
                  </span>

                  <span className="absolute inset-0 rounded-full bg-green-300/40 animate-electric-aura-green z-0"></span>

                  <span className="relative z-10 text-base animate-pulse">
                    ✨
                  </span>
                  <span className="relative z-10">Dự báo AI</span>
                </button>
              </div>
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
                            {prevIcon && (
                              <div
                                className="ant-image-preview-operations-operation"
                                onClick={() => onActive?.(-1)}
                              >
                                {prevIcon}
                              </div>
                            )}

                            {nextIcon && (
                              <div
                                className="ant-image-preview-operations-operation"
                                onClick={() => onActive?.(1)}
                              >
                                {nextIcon}
                              </div>
                            )}

                            <div
                              className="ant-image-preview-operations-operation"
                              onClick={onZoomIn}
                            >
                              {zoomInIcon}
                            </div>

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
                          disabledDate={(current) =>
                            current && current.year() > dayjs().year()
                          }
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
                          <Option value="SPECIAL">Xe đặc biệt</Option>
                          <Option value="OLD_STOCK">Xe tồn kho lâu ngày</Option>
                          <Option value="TEST_DRIVE">Xe lái thử</Option>
                          <Option value="RESERVED">Xe đã đặt cọc</Option>
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

      {/* MODAL AI Forecast */}
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
            {/* Thanh hành động phía trên */}
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

            {/* Bong bóng chat AI + danh sách gợi ý theo màu */}
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border">
                <img
                  src="/AI_avatar.png"
                  alt="AI Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="max-w-[640px] rounded-2xl bg-gray-100 px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-700">
                  Trong 3 tháng gần đây, hệ thống ghi nhận các màu sau có nhu
                  cầu cao, kèm số lượng xe nên nhập cho tháng tới.
                </p>

                {colorSuggestions.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-700">
                    Hệ thống chưa có đủ dữ liệu chi tiết theo màu để đưa ra gợi
                    ý nhập kho.
                  </p>
                ) : (
                  <>
                    <div className="mt-3 space-y-2">
                      {colorSuggestions.map((s) => {
                        const isSelected = selectedColors.includes(s.color);
                        const canAccept = s.quantity > 0;
                        const isThisApplying =
                          applyingFromAi && applyingColor === s.color;

                        return (
                          <div
                            key={s.color}
                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-gray-200"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                Màu {s.color}
                              </p>
                              <p className="text-xs text-gray-500">
                                Gợi ý nhập khoảng <b>{fmt(s.quantity)} xe</b>{" "}
                                trong tháng tới.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {canAccept ? (
                                <>
                                  <Button
                                    size="small"
                                    className={`rounded-full px-3 border ${
                                      isSelected
                                        ? "!border-[#627254] !text-[#627254]"
                                        : ""
                                    }`}
                                    disabled={applyingFromAi}
                                    onClick={() => toggleSelectColor(s.color)}
                                  >
                                    {isSelected ? "Đã chọn" : "Chọn"}
                                  </Button>
                                  <Button
                                    size="small"
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    className="rounded-full px-3 !bg-[#627254] !border-[#627254]"
                                    disabled={applyingFromAi}
                                    loading={isThisApplying}
                                    onClick={() =>
                                      handleApplySingleSuggestion(s)
                                    }
                                  >
                                    Nhập lô này
                                  </Button>
                                </>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">
                                  Nhu cầu ~0 xe, không tạo lô.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        className="rounded-full px-4 !bg-[#627254] !border-[#627254]"
                        disabled={!hasAnyPositive || applyingFromAi}
                        loading={applyingFromAi && applyingColor === null}
                        onClick={handleApplyAllSuggestions}
                      >
                        Nhập tất cả gợi ý khả dụng
                      </Button>

                      <Button
                        className="rounded-full px-4 border border-gray-300"
                        disabled={!hasSelectedPositive || applyingFromAi}
                        onClick={handleApplySelectedSuggestions}
                      >
                        Nhập các gợi ý đã chọn
                      </Button>

                      <Button
                        className="rounded-full px-4"
                        disabled={applyingFromAi}
                        onClick={() => setForecastOpen(false)}
                      >
                        Tạo thủ công
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Thẻ tóm tắt số liệu tổng quan */}
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
    </Modal>
  );
};

export default VehicleBulkPage;
