import React, { useMemo, useState } from "react";
import {
  Card,
  Button,
  Space,
  Skeleton,
  Empty,
  Alert,
  Row,
  Col,
  Select,
  Input,
  Statistic,
  Divider,
  Table,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  useDemandForecastFromAI,
  useCreateDemandForecasts,
} from "../../service/vehicleService";
import { CardWrapper } from "../../components/template/CardWrapper";

/** ====== Helpers an toàn với schema động ====== */
type Rec = Record<string, unknown>;

const num = (v: unknown) =>
  typeof v === "number"
    ? v
    : typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))
    ? Number(v)
    : null;

const asStr = (v: unknown) => (v === null || v === undefined ? "" : String(v));

const CANDIDATE_MEASURES = [
  "forecast",
  "forecastQty",
  "quantity",
  "demand",
  "value",
];
const CANDIDATE_TIME = ["month", "date", "period"];
const CANDIDATE_MODEL = ["model", "modelName", "brand"];
const CANDIDATE_REGION = ["region", "area", "location"];

/** chọn key đầu tiên có thật trong data */
function pickKey(keys: string[], rows: Rec[]) {
  const set = new Set(rows.flatMap((r) => Object.keys(r)));
  return keys.find((k) => set.has(k));
}

/** build columns động từ keys */
function buildColumns(rows: Rec[]): ColumnsType<Rec> {
  const keys = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );

  return keys.map<ColumnsType<Rec>[number]>((k) => ({
    title: k,
    dataIndex: k,
    align: "center",
    render: (v: unknown) => {
      const n = num(v);
      if (n !== null) return n.toLocaleString("vi-VN");
      return asStr(v) || "—";
    },
    sorter: (a, b) => {
      const va = a[k];
      const vb = b[k];
      const na = num(va);
      const nb = num(vb);
      if (na !== null && nb !== null) return na - nb;
      return asStr(va).localeCompare(asStr(vb), "vi");
    },
  }));
}

/** unique sorted values (string) */
function uniqueVals(rows: Rec[], key: string): string[] {
  const set = new Set<string>();
  rows.forEach((r) => set.add(asStr(r[key])));
  return Array.from(set)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "vi"));
}

/** CSV export */
function toCSV(rows: Rec[]): string {
  if (rows.length === 0) return "";
  const header = Object.keys(rows[0]);
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      header
        .map((h) => {
          const v = r[h];
          const s = v === null || v === undefined ? "" : String(v);
          // escape commas/quotes/newlines
          const needQuote = /[",\n]/.test(s);
          return needQuote ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}
function downloadCSV(rows: Rec[]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai_demand_forecast_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** ====== Page ====== */
export default function VehicleAIDemandPage() {
  // data
  const {
    forecast,
    isLoading,
    isFetching,
    error,
    refetch: refetchForecast,
  } = useDemandForecastFromAI({ keepPreviousData: true });

  const { refetch: triggerCreate, isFetching: creating } =
    useCreateDemandForecasts();

  // normalize array
  const rows = useMemo<Rec[]>(
    () =>
      Array.isArray(forecast)
        ? (forecast as Rec[])
        : forecast
        ? [forecast as Rec]
        : [],
    [forecast]
  );

  // detect keys
  const measureKey = useMemo(() => pickKey(CANDIDATE_MEASURES, rows), [rows]);
  const timeKey = useMemo(() => pickKey(CANDIDATE_TIME, rows), [rows]);
  const modelKey = useMemo(() => pickKey(CANDIDATE_MODEL, rows), [rows]);
  const regionKey = useMemo(() => pickKey(CANDIDATE_REGION, rows), [rows]);

  // filters (ẩn nếu không có key)
  const [modelF, setModelF] = useState<string | undefined>(undefined);
  const [regionF, setRegionF] = useState<string | undefined>(undefined);
  const [timeF, setTimeF] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!rows.length) return rows;
    return rows.filter((r) => {
      if (modelKey && modelF && asStr(r[modelKey]) !== modelF) return false;
      if (regionKey && regionF && asStr(r[regionKey]) !== regionF) return false;
      if (timeKey && timeF && asStr(r[timeKey]) !== timeF) return false;
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        const has = Object.values(r).some((v) =>
          asStr(v).toLowerCase().includes(s)
        );
        if (!has) return false;
      }
      return true;
    });
  }, [rows, modelKey, regionKey, timeKey, modelF, regionF, timeF, search]);

  // KPIs nếu có measureKey
  const kpis = useMemo(() => {
    if (!measureKey) return null;
    const total = filtered.reduce(
      (acc, r) => acc + (num(r[measureKey!]) ?? 0),
      0
    );
    const count = filtered.length;

    // top model / region (nếu có)
    function topBy(key?: string) {
      if (!key) return undefined;
      const m = new Map<string, number>();
      filtered.forEach((r) => {
        const k = asStr(r[key]);
        const v = num(r[measureKey!] ?? 0) ?? 0;
        m.set(k, (m.get(k) ?? 0) + v);
      });
      const arr = Array.from(m.entries()).filter(([k]) => k);
      if (!arr.length) return undefined;
      arr.sort((a, b) => b[1] - a[1]);
      return { key: arr[0][0], value: arr[0][1] };
    }

    return {
      total,
      count,
      topModel: topBy(modelKey),
      topRegion: topBy(regionKey),
    };
  }, [filtered, measureKey, modelKey, regionKey]);

  const onCreate = async () => {
    const res = await triggerCreate();
    if (res?.error) {
      message.error("Không thể tạo dự báo mới.");
      return;
    }
    message.success("Đã tạo dự báo mới, đang làm mới dữ liệu…");
    refetchForecast();
  };

  const columns = useMemo(() => buildColumns(filtered), [filtered]);

  return (
    <CardWrapper
      title="Dự báo nhu cầu phân phối (AI)"
      subtitle="Trang hiển thị kết quả dự báo do AI trả về từ API. Mọi thành phần chỉ hiện khi có dữ liệu phù hợp."
      variant="dashboard"
    >
      {/* Action bar */}
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={onCreate}
            loading={creating}
            className="rounded-md"
          >
            Tạo dự báo mới
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchForecast()}
            loading={isFetching}
            className="rounded-md"
          >
            Làm mới
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadCSV(filtered)}
            disabled={filtered.length === 0}
            className="rounded-md"
          >
            Xuất CSV
          </Button>
        </Space>

        {/* Search chung */}
        <Input.Search
          placeholder="Tìm kiếm mọi cột…"
          allowClear
          style={{ width: 280 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* Filters điều kiện */}
      {(modelKey || regionKey || timeKey) && rows.length > 0 && (
        <Card size="small" className="mb-4 rounded-xl">
          <Row gutter={[12, 12]}>
            {modelKey && (
              <Col xs={24} md={8}>
                <label className="text-xs text-gray-500">Model</label>
                <Select
                  className="w-full"
                  placeholder="Tất cả"
                  allowClear
                  value={modelF}
                  onChange={(v) => setModelF(v)}
                  options={uniqueVals(rows, modelKey).map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Col>
            )}
            {regionKey && (
              <Col xs={24} md={8}>
                <label className="text-xs text-gray-500">Khu vực</label>
                <Select
                  className="w-full"
                  placeholder="Tất cả"
                  allowClear
                  value={regionF}
                  onChange={(v) => setRegionF(v)}
                  options={uniqueVals(rows, regionKey).map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Col>
            )}
            {timeKey && (
              <Col xs={24} md={8}>
                <label className="text-xs text-gray-500">Kỳ</label>
                <Select
                  className="w-full"
                  placeholder="Tất cả"
                  allowClear
                  value={timeF}
                  onChange={(v) => setTimeF(v)}
                  options={uniqueVals(rows, timeKey).map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* KPIs (chỉ hiện khi có measureKey) */}
      {kpis && (
        <>
          <Row gutter={[16, 16]} className="mb-2">
            <Col xs={24} md={8}>
              <Card className="rounded-xl">
                <Statistic
                  title="Tổng giá trị dự báo (lọc hiện tại)"
                  value={kpis.total}
                  precision={0}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="rounded-xl">
                <Statistic title="Số bản ghi" value={kpis.count} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="rounded-xl">
                <div className="flex justify-between">
                  <Statistic
                    title="Top Model"
                    value={kpis.topModel?.key ?? "—"}
                    valueStyle={{ fontSize: 16 }}
                  />
                  <Statistic
                    title="Giá trị"
                    value={kpis.topModel?.value ?? 0}
                    precision={0}
                  />
                </div>
              </Card>
            </Col>
          </Row>
          {kpis.topRegion && (
            <Row gutter={[16, 16]} className="mb-2">
              <Col xs={24} md={8}>
                <Card className="rounded-xl">
                  <div className="flex justify-between">
                    <Statistic
                      title="Top Khu vực"
                      value={kpis.topRegion?.key ?? "—"}
                      valueStyle={{ fontSize: 16 }}
                    />
                    <Statistic
                      title="Giá trị"
                      value={kpis.topRegion?.value ?? 0}
                      precision={0}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          )}
          <Divider className="my-4" />
        </>
      )}

      {/* Data area */}
      <Card className="rounded-2xl">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : error ? (
          <Alert
            type="error"
            showIcon
            message="Không tải được dữ liệu dự báo."
          />
        ) : rows.length === 0 ? (
          <Empty description="Chưa có dữ liệu. Hãy bấm 'Tạo dự báo mới'." />
        ) : (
          <Table<Rec>
            rowKey={(_, i) => String(i)}
            dataSource={filtered}
            columns={columns}
            size="middle"
            bordered
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </CardWrapper>
  );
}
