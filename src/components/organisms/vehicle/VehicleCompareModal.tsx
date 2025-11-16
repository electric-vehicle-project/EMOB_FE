/* eslint-disable @typescript-eslint/no-explicit-any */
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

const PLACEHOLDER =
  "https://placehold.co/420x300?text=Ch%C6%B0a+c%C3%B3+%E1%BA%A3nh";

const isNum = (v: any) =>
  typeof v === "number" ||
  (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)));

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

const normBetter = (v: any): "left" | "right" | null => {
  const s = String(v ?? "").toLowerCase();
  if (s === "left") return "left";
  if (s === "right") return "right";
  return null;
};

const fmt = (key: string, value: any): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (MONEY.has(key) && isNum(value))
    return `${Number(value).toLocaleString("vi-VN")} VNĐ`;
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

  const options = useMemo(() => {
    const list = Array.isArray(vehicles) ? (vehicles as IVehicle[]) : [];

    return list
      .filter((v) => v.id !== leftId)
      .map((v) => ({
        value: v.id!,
        label: `${v.brand ?? ""} ${v.model ?? ""}`.trim() || v.id,
      }));
  }, [vehicles, leftId]);

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
    Array.isArray(leftInfo?.images) && leftInfo.images.length
      ? leftInfo.images[0]
      : PLACEHOLDER;

  const rightImg =
    Array.isArray(rightInfo?.images) && rightInfo?.images.length
      ? rightInfo.images[0]
      : PLACEHOLDER;

  const isBackendFieldAArray = (v: any): v is any[] =>
    Array.isArray(v) && v.every((e) => typeof e.keyName === "string");

  const isBackendRespB = (v: any): v is { fields: any[] } =>
    typeof v === "object" && v !== null && Array.isArray(v.fields);

  function parsePayload(payload: any): CompareRow[] {
    const maybe = payload?.result ?? payload;

    if (isBackendRespB(maybe)) {
      return maybe.fields.map((f) => {
        const rawKey = f.key || f.label || "";
        const k = canonicalKey(rawKey);
        return {
          key: k,
          label: LABELS[k] ?? rawKey,
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

  const pickCellValue = (src: IVehicle | undefined, key: string) => {
    if (!src || !isMetricKey(key)) return undefined;
    const v = src[key];
    return v ?? undefined;
  };

  function fillAbsoluteValues(list: CompareRow[]): CompareRow[] {
    return list.map((r) => ({
      ...r,
      left: pickCellValue(leftInfo!, r.key),
      right: pickCellValue(rightInfo!, r.key),
      different: !!r.different,
    }));
  }

  const handleCompare = async (id: string) => {
    setRightId(id);
    try {
      setLoading(true);
      const res = await api.get(`/vehicle/${leftId}/vs/${id}`);
      const parsed = parsePayload(res.data);
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

  const stats = useMemo(() => {
    const data = rows ?? [];
    let left = 0;
    let right = 0;
    let equal = 0;
    data.forEach((r) => {
      if (!r.different || !r.betterFor) equal++;
      else if (r.betterFor === "left") left++;
      else if (r.betterFor === "right") right++;
    });
    return { left, right, equal, total: data.length };
  }, [rows]);

  const BG = {
    win: "rgba(34, 197, 94, 0.28)",
    lose: "rgba(220, 38, 38, 0.12)",
    equal: "rgba(148, 163, 184, 0.16)",
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
      width={1000}
      destroyOnClose
      footer={null}
      title={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ColumnWidthOutlined className="text-[#627254]" />
            <span className="font-semibold text-[15px]">So sánh mẫu xe</span>
            <Tooltip title="So sánh thông số và giá giữa hai mẫu xe">
              <InfoCircleOutlined className="text-gray-500" />
            </Tooltip>
          </div>
          <span className="text-xs text-gray-500">
            Chọn mẫu xe để xem bảng so sánh.
          </span>
        </div>
      }
    >
      <div className="w-full mb-4">
        <Text className="text-sm text-gray-700 mb-2 block">
          Chọn mẫu xe để so sánh với “{leftName || leftId}”:
        </Text>

        <Select
          className="w-full mt-1"
          placeholder="Chọn mẫu xe"
          value={rightId}
          onChange={handleCompare}
          showSearch
          options={options}
          optionFilterProp="label"
        />
      </div>

      <Divider className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
        <div className="md:col-span-5 border rounded-2xl p-5 bg-white">
          <div className="w-full h-48 overflow-hidden rounded-xl border flex items-center justify-center mb-3">
            <img
              src={leftImg}
              alt={leftName}
              className="object-contain h-full"
            />
          </div>
          <Title level={4}>{leftName}</Title>
          {leftInfo?.retailPrice ? (
            <Tag color="green">
              Giá bán lẻ: {leftInfo.retailPrice.toLocaleString("vi-VN")} VNĐ
            </Tag>
          ) : (
            <Tag>Chưa có giá</Tag>
          )}
        </div>

        <div className="hidden md:flex md:col-span-2 items-center justify-center">
          <ArrowRightOutlined style={{ fontSize: 24, color: "#999" }} />
        </div>

        <div className="md:col-span-5 border rounded-2xl p-5 bg-white">
          <div className="w-full h-48 overflow-hidden rounded-xl border flex items-center justify-center mb-3">
            <img
              src={rightImg}
              alt={rightName}
              className="object-contain h-full"
            />
          </div>
          <Title level={4}>{rightName || "Chưa chọn mẫu"}</Title>
          {rightInfo?.retailPrice ? (
            <Tag color="blue">
              Giá bán lẻ: {rightInfo.retailPrice.toLocaleString("vi-VN")} VNĐ
            </Tag>
          ) : (
            <Tag>Chưa có giá</Tag>
          )}
        </div>
      </div>

      {rows && (
        <>
          <Divider className="my-6" />
          <Space wrap size={[8, 8]} className="mb-3">
            <Tag color="green">Mẫu hiện tại tốt hơn: {stats.left}</Tag>
            <Tag color="blue">Mẫu so sánh tốt hơn: {stats.right}</Tag>
            <Tag>Tương đương: {stats.equal}</Tag>
            <Tag color="gold">Tổng tiêu chí: {stats.total}</Tag>
          </Space>
        </>
      )}

      <div className="mt-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : !rows ? (
          <Alert type="info" showIcon message="Hãy chọn một mẫu xe." />
        ) : rows.length === 0 ? (
          <Empty description="Không có dữ liệu so sánh." />
        ) : (
          <Table<CompareRow>
            pagination={false}
            size="middle"
            rowKey={(r) => r.key}
            dataSource={rows}
            columns={[
              {
                title: "Tiêu chí",
                dataIndex: "label",
                width: 240,
                render: (v) => <Text strong>{v}</Text>,
              },
              {
                title: "Mẫu hiện tại",
                dataIndex: "left",
                render: (_, r) => (
                  <div style={cellBg("left", r)}>
                    <Text>{fmt(r.key, r.left)}</Text>
                  </div>
                ),
              },
              {
                title: "Mẫu so sánh",
                dataIndex: "right",
                render: (_, r) => (
                  <div style={cellBg("right", r)}>
                    <Text>{fmt(r.key, r.right)}</Text>
                  </div>
                ),
              },
              {
                title: "Nhận định",
                dataIndex: "betterFor",
                width: 260,
                render: (v) => {
                  if (!v) return <Tag>Không có chênh lệch</Tag>;
                  const name = v === "left" ? leftName : rightName;
                  return (
                    <Tag color={v === "left" ? "green" : "blue"}>
                      <ArrowUpOutlined /> Mẫu {name} tốt hơn
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
