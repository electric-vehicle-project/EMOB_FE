import {
  Modal,
  Select,
  Typography,
  Space,
  Table,
  Tag,
  Empty,
  Spin,
  Tooltip,
  Divider,
  Alert,
} from "antd";
import {
  InfoCircleOutlined,
  ArrowRightOutlined,
  ColumnWidthOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  useGetVehicles,
  useGetVehicleById,
} from "../../../service/vehicleService";
import api from "../../../config/api";
import type { IVehicle } from "../../../model/Vehicle";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  leftId: string;
}

type CompareRow = {
  key: string;
  label: string;
  left?: number | string | null;
  right?: number | string | null;
  different: boolean;
  betterFor?: "left" | "right" | null;
};

const LABELS: Record<string, string> = {
  brand: "Hãng",
  model: "Mẫu",
  type: "Loại xe",
  batteryKwh: "Dung lượng pin (kWh)",
  rangeKm: "Tầm hoạt động (km)",
  chargeTimeHr: "Thời gian sạc (giờ)",
  powerKw: "Công suất (kW)",
  weightKg: "Khối lượng (kg)",
  topSpeedKmh: "Tốc độ tối đa (km/h)",
  importPrice: "Giá nhập (₫)",
  retailPrice: "Giá bán lẻ (₫)",
};
const UNITS: Record<string, string> = {
  batteryKwh: "kWh",
  rangeKm: "km",
  chargeTimeHr: "giờ",
  powerKw: "kW",
  weightKg: "kg",
  topSpeedKmh: "km/h",
};
const MONEY = new Set(["importPrice", "retailPrice"]);
const ORDER = [
  "brand",
  "model",
  "type",
  "retailPrice",
  "importPrice",
  "batteryKwh",
  "rangeKm",
  "powerKw",
  "topSpeedKmh",
  "chargeTimeHr",
  "weightKg",
];

const PLACEHOLDER = "https://placehold.co/420x300?text=No+Image";
const isNum = (v: unknown) =>
  typeof v === "number" ||
  (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)));

type MetricKey =
  | "brand"
  | "model"
  | "type"
  | "batteryKwh"
  | "rangeKm"
  | "chargeTimeHr"
  | "powerKw"
  | "weightKg"
  | "topSpeedKmh"
  | "importPrice"
  | "retailPrice";

const METRIC_KEYS = new Set<MetricKey>([
  "brand",
  "model",
  "type",
  "batteryKwh",
  "rangeKm",
  "chargeTimeHr",
  "powerKw",
  "weightKg",
  "topSpeedKmh",
  "importPrice",
  "retailPrice",
]);

const isMetricKey = (k: string): k is MetricKey =>
  METRIC_KEYS.has(k as MetricKey);

const canonicalKey = (keyName: string): string => {
  const k = keyName.toLowerCase();
  if (k.includes("battery") || k.includes("pin") || k.includes("kwh"))
    return "batteryKwh";
  if (k.includes("range") || k.includes("tầm")) return "rangeKm";
  if (k.includes("charge") || k.includes("sạc")) return "chargeTimeHr";
  if (k.includes("power") || k.includes("công suất")) return "powerKw";
  if (k.includes("speed") || k.includes("tốc độ")) return "topSpeedKmh";
  if (k.includes("weight") || k.includes("khối lượng")) return "weightKg";
  if (k.includes("import")) return "importPrice";
  if (k.includes("retail") || k.includes("bán lẻ")) return "retailPrice";
  if (k.includes("brand") || k.includes("hãng")) return "brand";
  if (k.includes("model") || k.includes("mẫu")) return "model";
  if (k.includes("type") || k.includes("loại")) return "type";
  return keyName;
};
const normBetter = (v: unknown): "left" | "right" | null => {
  const s = String(v ?? "").toLowerCase();
  if (s === "left") return "left";
  if (s === "right") return "right";
  return null;
};
const fmt = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (MONEY.has(key) && isNum(value))
    return `${Number(value).toLocaleString("vi-VN")}₫`;
  if (isNum(value)) {
    const unit = UNITS[key];
    return unit
      ? `${Number(value).toLocaleString("vi-VN")} ${unit}`
      : Number(value).toLocaleString("vi-VN");
  }
  return String(value);
};

export const VehicleCompareModal = ({ open, onClose, leftId }: Props) => {
  const [rightId, setRightId] = useState<string>();
  const [rows, setRows] = useState<CompareRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const { vehicles } = useGetVehicles({ size: 100 }, { enabled: open });
  const { vehicle: leftInfo } = useGetVehicleById(leftId, { enabled: open });
  const { vehicle: rightInfo } = useGetVehicleById(rightId ?? "", {
    enabled: open && !!rightId,
  });

  const options = useMemo(
    () =>
      (Array.isArray(vehicles) ? (vehicles as IVehicle[]) : [])
        .filter((v) => v.id !== leftId)
        .map((v) => ({
          value: v.id!,
          label: `${v.brand ?? ""} ${v.model ?? ""}`.trim() || v.id,
        })),
    [vehicles, leftId]
  );

  useEffect(() => {
    if (!open) {
      setRightId(undefined);
      setRows(null);
    }
  }, [open]);

  const leftName = leftInfo
    ? `${leftInfo.brand ?? ""} ${leftInfo.model ?? ""}`.trim() || leftInfo.id
    : "";
  const rightName =
    rightInfo && rightId
      ? `${rightInfo.brand ?? ""} ${rightInfo.model ?? ""}`.trim() || rightId
      : "";

  const leftImg =
    Array.isArray(leftInfo?.images) && leftInfo?.images.length
      ? (leftInfo!.images as string[])[0]
      : PLACEHOLDER;
  const rightImg =
    Array.isArray(rightInfo?.images) && rightInfo?.images.length
      ? (rightInfo!.images as string[])[0]
      : PLACEHOLDER;

  // =========================
  // Parse payload từ BE (typed, không dùng any)
  // =========================
  type BackendFieldA = {
    keyName: string;
    vehicleValue?: number | string | null;
    different?: boolean;
    betterFor?: unknown;
  };
  type BackendFieldB = {
    key?: string;
    label?: string;
    different?: boolean;
    betterFor?: unknown;
  };
  type BackendRespB = { fields: BackendFieldB[] };

  const isBackendFieldAArray = (v: unknown): v is BackendFieldA[] =>
    Array.isArray(v) &&
    v.every((e) => {
      const rec = e as Record<string, unknown>;
      return typeof rec.keyName === "string";
    });

  const isBackendRespB = (v: unknown): v is BackendRespB => {
    if (typeof v !== "object" || v === null) return false;
    const rec = v as Record<string, unknown>;
    const fields = rec.fields;
    return (
      Array.isArray(fields) &&
      fields.every((f) => {
        const r = f as Record<string, unknown>;
        return (
          typeof r === "object" &&
          r !== null &&
          (typeof r.key === "string" || typeof r.label === "string")
        );
      })
    );
  };

  function parsePayload(payload: unknown): CompareRow[] {
    const maybe = (payload as { result?: unknown })?.result ?? payload;

    if (isBackendRespB(maybe)) {
      return maybe.fields.map((f) => {
        const rawKey =
          typeof f.key === "string"
            ? f.key
            : typeof f.label === "string"
            ? f.label
            : "";
        const k = canonicalKey(rawKey);
        return {
          key: k,
          label: LABELS[k] ?? (typeof f.label === "string" ? f.label : rawKey),
          betterFor: normBetter(f.betterFor),
          different: !!f.different,
        };
      });
    }

    if (isBackendFieldAArray(maybe)) {
      return maybe.map((x) => {
        const k = canonicalKey(x.keyName);
        return {
          key: k,
          label: LABELS[k] ?? x.keyName,
          betterFor: normBetter(x.betterFor),
          different: !!x.different,
        };
      });
    }

    return [];
  }

  // Lấy giá trị tuyệt đối từ 2 vehicle detail (không tự tính tốt/kém)
  type Cell = string | number | null | undefined;
  const pickCellValue = (src: IVehicle | undefined, key: string): Cell => {
    if (!src || !isMetricKey(key)) return undefined;
    const v = src[key];
    if (v === null || v === undefined) return undefined;
    return typeof v === "number" || typeof v === "string" ? v : undefined;
  };

  function fillAbsoluteValues(list: CompareRow[]): CompareRow[] {
    return list.map((r) => ({
      ...r,
      left: pickCellValue(leftInfo as IVehicle | undefined, r.key),
      right: pickCellValue(rightInfo as IVehicle | undefined, r.key),
      different: !!r.different,
    }));
  }

  const handleCompare = async () => {
    if (!rightId) return;
    try {
      setLoading(true);
      const res = await api.get(`/vehicle/${leftId}/vs/${rightId}`);
      const parsed = parsePayload(res?.data as unknown);
      const completed = fillAbsoluteValues(parsed);

      const sorted = [...completed].sort((a, b) => {
        if (a.different !== b.different) return a.different ? -1 : 1;
        const ia = ORDER.indexOf(a.key);
        const ib = ORDER.indexOf(b.key);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.label.localeCompare(b.label, "vi");
      });

      setRows(sorted);
    } finally {
      setLoading(false);
    }
  };

  // Thống kê nhanh
  const stats = useMemo(() => {
    const data = rows ?? [];
    let left = 0,
      right = 0,
      equal = 0;
    data.forEach((r) => {
      if (!r.different || !r.betterFor) equal++;
      else if (r.betterFor === "left") left++;
      else if (r.betterFor === "right") right++;
    });
    return { left, right, equal, total: data.length };
  }, [rows]);

  // Màu nền theo phán quyết BE
  const BG = {
    win: "rgba(76,175,80,0.12)",
    lose: "rgba(244,67,54,0.12)",
    equal: "rgba(158,158,158,0.12)",
  };
  const cellBg = (side: "left" | "right", r: CompareRow) => {
    if (!r.different || !r.betterFor)
      return { background: BG.equal, borderRadius: 8, padding: 8 };
    if (r.betterFor === side)
      return { background: BG.win, borderRadius: 8, padding: 8 };
    return { background: BG.lose, borderRadius: 8, padding: 8 };
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      okText="Bắt đầu so sánh"
      title={
        <Space align="center" size={8}>
          <ColumnWidthOutlined className="text-[#627254]" />
          <span>So sánh mẫu xe</span>
          <Tooltip title="Giá trị hiển thị là thông số thật của 2 mẫu; màu nền: xanh (tốt hơn), đỏ (kém hơn), xám (bằng nhau).">
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      width={1000}
      destroyOnClose
      onOk={handleCompare}
      okButtonProps={{
        disabled: !rightId,
        className:
          "!bg-[#627254] !border-[#627254] hover:!bg-[#76885B] rounded-md",
      }}
    >
      {/* Chọn xe */}
      <div className="w-full">
        <Text>Chọn mẫu xe để so sánh với “{leftName || leftId}”:</Text>
        <Select
          className="w-full mt-2"
          placeholder="Chọn mẫu xe"
          value={rightId}
          onChange={setRightId}
          showSearch
          options={options}
          optionFilterProp="label"
        />
      </div>

      {/* Header có ảnh */}
      <Divider className="my-12" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-6">
        <div className="md:col-span-5 border rounded-2xl p-12 md:p-6 bg-white">
          <div className="text-xs text-gray-500 mb-1">Hiện tại</div>
          <div className="w-full h-48 overflow-hidden rounded-xl border flex items-center justify-center bg-white mb-3">
            <img
              src={leftImg}
              alt={leftName}
              className="object-contain h-full"
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)
              }
            />
          </div>
          <Title level={4} style={{ marginTop: 0 }}>
            {leftName || "—"}
          </Title>
          {leftInfo?.retailPrice ? (
            <Tag color="green">
              Giá bán lẻ: {leftInfo.retailPrice.toLocaleString("vi-VN")}₫
            </Tag>
          ) : (
            <Tag>Chưa có giá</Tag>
          )}
        </div>

        <div className="hidden md:flex md:col-span-2 items-center justify-center">
          <ArrowRightOutlined style={{ fontSize: 24, color: "#999" }} />
        </div>

        <div className="md:col-span-5 border rounded-2xl p-12 md:p-6 bg-white">
          <div className="text-xs text-gray-500 mb-1">Xe so sánh</div>
          <div className="w-full h-48 overflow-hidden rounded-xl border flex items-center justify-center bg-white mb-3">
            <img
              src={rightImg}
              alt={rightName}
              className="object-contain h-full"
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)
              }
            />
          </div>
          <Title level={4} style={{ marginTop: 0 }}>
            {rightName || "—"}
          </Title>
          {rightInfo?.retailPrice ? (
            <Tag color="blue">
              Giá bán lẻ: {rightInfo.retailPrice.toLocaleString("vi-VN")}₫
            </Tag>
          ) : (
            <Tag>Chưa có giá</Tag>
          )}
        </div>
      </div>

      {/* Tóm tắt */}
      {rows && (
        <>
          <Divider className="my-12" />
          <Space wrap size={[8, 8]} aria-label="Tóm tắt kết quả so sánh">
            <Tag color="green">Hiện tại tốt hơn: {stats.left}</Tag>
            <Tag color="blue">Xe so sánh tốt hơn: {stats.right}</Tag>
            <Tag>Giống nhau: {stats.equal}</Tag>
            <Tag color="gold">Tổng tiêu chí: {stats.total}</Tag>
          </Space>
        </>
      )}

      {/* Bảng so sánh */}
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : !rows ? (
          <Alert
            className="mt-3"
            type="info"
            showIcon
            message="Hãy chọn mẫu xe rồi nhấn “Bắt đầu so sánh”."
          />
        ) : rows.length === 0 ? (
          <Empty description="Chưa có dữ liệu so sánh" />
        ) : (
          <Table<CompareRow>
            pagination={false}
            rowKey={(r) => r.key}
            dataSource={rows}
            className="rounded-xl overflow-hidden"
            columns={[
              {
                title: "Thông số",
                dataIndex: "label",
                width: 240,
                render: (v: string) => <Text strong>{v}</Text>,
              },
              {
                title: "Hiện tại",
                dataIndex: "left",
                render: (_: unknown, r) => (
                  <div style={cellBg("left", r)}>
                    <Text>{fmt(r.key, r.left)}</Text>
                  </div>
                ),
              },
              {
                title: "Xe so sánh",
                dataIndex: "right",
                render: (_: unknown, r) => (
                  <div style={cellBg("right", r)}>
                    <Text>{fmt(r.key, r.right)}</Text>
                  </div>
                ),
              },
              {
                title: "Nhận định",
                dataIndex: "betterFor",
                width: 260,
                render: (v: CompareRow["betterFor"]) => {
                  if (!v) return <Tag>Không chênh lệch</Tag>;
                  const name =
                    v === "left"
                      ? leftName || "Hiện tại"
                      : rightName || "Xe so sánh";
                  return (
                    <Tag color={v === "left" ? "green" : "blue"}>
                      <ArrowUpOutlined /> Nghiêng về “{name}”
                    </Tag>
                  );
                },
              },
            ]}
          />
        )}
      </div>
    </Modal>
  );
};

export default VehicleCompareModal;
