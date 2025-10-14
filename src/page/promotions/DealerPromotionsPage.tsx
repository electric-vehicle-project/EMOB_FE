// ⬆️ giữ nguyên các import sẵn có...
import { useMemo, useState } from "react";
import { Button, Card, Select, Table, Tabs, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

import { usePromotionList } from "../../service/promotionService";
import { ROUTES } from "../../model/routePaths";
import {
  canCreate,
  canDelete,
  type Role,
} from "../../utils/promotionPermissions";
import type {
  Promotion,
  PromotionScope,
  PromotionStatus,
  PromotionType,
} from "../../model/Promotion";

// đọc role  từ Redux store
import { useSelector } from "react-redux";

// ===== helpers =====
const buildPath = (...parts: string[]) =>
  "/" +
  parts
    .map((s) => (s || "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");

type TabKey = "all" | "active" | "pending" | "expired";

export default function DealerPromotionsPage() {
  const navigate = useNavigate();

  // Lấy role từ store. Viết kiểu không phụ thuộc exact shape.
  type RootLike = {
    user?: { role?: Role; current?: { role?: Role } };
    auth?: { user?: { role?: Role } };
  };
  const role = useSelector(
    (s: RootLike) => s.user?.role ?? s.user?.current?.role ?? s.auth?.user?.role
  ) as Role | undefined;

  const [scopeView, setScopeView] = useState<PromotionScope>("LOCAL");
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const { data, isLoading } = usePromotionList(scopeView, page, size);
  const pageData = data?.result;

  const rows = useMemo(() => pageData?.data ?? [], [pageData]);
  const total = pageData?.metadata?.totalElements ?? 0;

  const filtered = useMemo(() => {
    if (tab === "pending")
      return rows.filter((p: Promotion) => p.value == null);
    if (tab === "active")
      return rows.filter((p: Promotion) => p.status === "ACTIVE");
    if (tab === "expired")
      return rows.filter((p: Promotion) => p.status === "EXPIRED");
    return rows;
  }, [rows, tab]);

  const goCreate = () =>
    navigate(buildPath(ROUTES.DEALER_STAFF, ROUTES.PROMOTION_CREATE));
  const goEdit = (id: string) =>
    navigate(
      buildPath(ROUTES.DEALER_STAFF, ROUTES.PROMOTION_EDIT.replace(":id", id))
    );

  const typeFilters = (
    [
      "PERCENTAGE",
      "AMOUNT",
      "ACCESSORY",
      "INSTALLMENT_SUPPORT",
    ] as PromotionType[]
  ).map((v) => ({ text: v, value: v }));

  const statusFilters = (
    ["UPCOMING", "ACTIVE", "INACTIVE", "EXPIRED"] as PromotionStatus[]
  ).map((v) => ({ text: v, value: v }));

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      filters: typeFilters,
      onFilter: (v, r) => r.type === v,
      render: (t: PromotionType) => (
        <Tag
          style={{
            background: "var(--primary-color, #627254)",
            color: "#fff",
            border: "none",
            padding: "2px 12px",
            borderRadius: 6,
          }}
        >
          {t}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      align: "center",
      sorter: (a, b) => {
        const av = a.value == null ? Number.NEGATIVE_INFINITY : Number(a.value);
        const bv = b.value == null ? Number.NEGATIVE_INFINITY : Number(b.value);
        return av - bv;
      },
      render: (v: number | null) =>
        v == null ? (
          <Tooltip title="Chờ Manager/Admin duyệt và điền giá trị">
            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>—</span>
          </Tooltip>
        ) : (
          v
        ),
    },
    {
      title: "Min Value",
      dataIndex: "minValue",
      key: "minValue",
      align: "center",
      sorter: (a, b) => (a.minValue ?? 0) - (b.minValue ?? 0),
    },
    {
      title: "Hiệu lực",
      key: "period",
      align: "center",
      sorter: (a, b) =>
        dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
      render: (_, r) =>
        `${dayjs(r.startDate).format("DD/MM/YYYY")} – ${dayjs(r.endDate).format(
          "DD/MM/YYYY"
        )}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: statusFilters,
      onFilter: (v, r) => r.status === v,
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (s: PromotionStatus) => {
        switch (s) {
          case "ACTIVE":
            return (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                ACTIVE
              </Tag>
            );
          case "UPCOMING":
            return (
              <Tag color="gold" icon={<ClockCircleOutlined />}>
                UPCOMING
              </Tag>
            );
          case "EXPIRED":
            return (
              <Tag color="default" icon={<StopOutlined />}>
                EXPIRED
              </Tag>
            );
          default:
            return <Tag>{s}</Tag>;
        }
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => {
        if (scopeView === "GLOBAL") return null; // Dealer chỉ thao tác LOCAL
        return (
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <Button
              icon={<EditOutlined />}
              size="middle"
              onClick={() => goEdit(record.id)}
              style={{
                background: "var(--primary-color, #627254)",
                color: "#fff",
                border: "none",
                height: 32,
              }}
            >
              Sửa
            </Button>

            {/* ✅ chỉ hiện nút Xoá khi có role & được phép */}
            {role && canDelete(role, record.scope) && (
              <Button icon={<DeleteOutlined />} danger size="middle">
                Xoá
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const tabItems = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Đang hoạt động" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "expired", label: "Hết hạn" },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            Quản lý khuyến mãi
          </h2>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Select
              value={scopeView}
              onChange={(v) => {
                setScopeView(v as PromotionScope);
                setPage(1);
              }}
              options={[
                { value: "LOCAL", label: "Khuyến mãi của đại lý" },
                { value: "GLOBAL", label: "Khuyến mãi của nhà sản xuất" },
              ]}
              style={{ width: 240 }}
            />

            {/* ✅ chỉ hiện khi có role & được phép */}
            {scopeView === "LOCAL" && role && canCreate(role, "LOCAL") && (
              <Button
                type="primary"
                style={{
                  background: "var(--primary-color, #627254)",
                  border: "none",
                }}
                onClick={goCreate}
              >
                Thêm khuyến mãi
              </Button>
            )}
          </div>
        </div>

        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          items={tabItems}
        />

        <Table
          loading={isLoading}
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            onChange: (p, ps) => {
              setPage(p);
              setSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
}
