import { useMemo, useState, type JSX } from "react";
import {
  Button,
  Card,
  message,
  Select,
  Table,
  Tabs,
  Tag,
  Spin,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import {
  usePromotionDelete,
  usePromotionList,
  usePromotionHistory,
} from "../../service/promotionService";
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

import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

const buildPath = (...parts: string[]) =>
  "/" +
  parts
    .map((s) => (s || "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");

type TabKey = "all" | "active" | "pending" | "expired";

const STATUS_TAGS: Record<
  PromotionStatus,
  { color: string; icon: JSX.Element }
> = {
  ACTIVE: { color: "green", icon: <CheckCircleOutlined /> },
  UPCOMING: { color: "gold", icon: <ClockCircleOutlined /> },
  EXPIRED: { color: "default", icon: <StopOutlined /> },
  INACTIVE: { color: "gray", icon: <StopOutlined /> },
};

export default function DealerPromotionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ===== USER ROLE =====
  type RootLike = {
    user?: {
      id?: string;
      dealerId?: string;
      role?: Role;
      current?: { role?: Role };
    };
    auth?: { user?: { id?: string; dealerId?: string; role?: Role } };
  };
  const user = useSelector((s: RootLike) => s.user ?? s.auth?.user ?? {});
  const role = (user?.role ?? "GUEST") as Role;
  const dealerId = user?.dealerId ?? "";

  // ===== STATE =====
  const [scopeView, setScopeView] = useState<PromotionScope>("LOCAL");
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // ===== API CALL =====
  const { data: globalData, isLoading: isLoadingGlobal } = usePromotionList(
    "GLOBAL",
    page - 1,
    size
  );
  const { data: localData, isLoading: isLoadingLocal } =
    usePromotionHistory(dealerId);

  const promotions = useMemo(() => {
    return scopeView === "GLOBAL"
      ? globalData?.result?.data ?? []
      : localData?.result ?? [];
  }, [scopeView, globalData, localData]);

  const isLoading = scopeView === "GLOBAL" ? isLoadingGlobal : isLoadingLocal;

  // ===== POPUP ROLE ALERT =====
  const showNoPermission = (action: string) => {
    Modal.warning({
      title: "Không có quyền",
      content: `Bạn không có quyền thực hiện hành động "${action}".`,
      okText: "Đã hiểu",
    });
  };

  // ===== FILTER TABS =====
  const filtered = useMemo(() => {
    if (tab === "pending") {
      return promotions.filter((p: Promotion) => {
        const missingCore =
          !p.type ||
          !p.status ||
          !p.startDate ||
          !p.endDate ||
          p.value == null ||
          p.value === 0;
        return missingCore;
      });
    }
    if (tab === "active")
      return promotions.filter((p: Promotion) => p.status === "ACTIVE");
    if (tab === "expired")
      return promotions.filter((p: Promotion) => p.status === "EXPIRED");
    return promotions;
  }, [promotions, tab]);

  // ===== TAB COUNTS =====
  const tabCounts = useMemo(() => {
    const all = promotions.length;
    const active = promotions.filter(
      (p: Promotion) => p.status === "ACTIVE"
    ).length;
    const expired = promotions.filter(
      (p: Promotion) => p.status === "EXPIRED"
    ).length;
    const pending = promotions.filter(
      (p: Promotion) =>
        !p.type ||
        !p.status ||
        !p.startDate ||
        !p.endDate ||
        p.value == null ||
        p.value === 0
    ).length;
    return { all, active, expired, pending };
  }, [promotions]);

  // ===== DELETE PROMOTION =====
  const { mutateAsync: deletePromotion } = usePromotionDelete();

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion(id);
      queryClient.invalidateQueries({ queryKey: ["promotionList"] });
      message.success("Đã xoá khuyến mãi thành công");
    } catch (err) {
      console.error(err);
      message.error("Không thể xoá khuyến mãi, vui lòng thử lại");
    }
  };

  // ===== NAVIGATIONS =====
  const goCreate = () =>
    navigate(buildPath(ROUTES.DEALER_STAFF, ROUTES.PROMOTION_CREATE));
  const goEdit = (id: string) =>
    navigate(
      buildPath(ROUTES.DEALER_STAFF, ROUTES.PROMOTION_EDIT.replace(":id", id))
    );

  // ===== COLUMN CONFIG =====
  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (t: PromotionType | null) =>
        t ? (
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
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      align: "center",
      render: (v: number | null) =>
        v == null || v === 0 ? <span style={{ color: "#9ca3af" }}>—</span> : v,
    },
    {
      title: "Hiệu lực",
      key: "period",
      align: "center",
      render: (_, r) =>
        r.startDate && r.endDate ? (
          `${dayjs(r.startDate).format("DD/MM/YYYY")} – ${dayjs(
            r.endDate
          ).format("DD/MM/YYYY")}`
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (s: PromotionStatus | null) =>
        s ? (
          <Tag color={STATUS_TAGS[s]?.color} icon={STATUS_TAGS[s]?.icon}>
            {s}
          </Tag>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => {
        const canEditThis =
          scopeView === "LOCAL" && canCreate(role as Role, "LOCAL");
        const canDeleteThis =
          scopeView === "LOCAL" && canDelete(role as Role, "LOCAL");

        return (
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {/* Edit button */}
            <Button
              icon={<EditOutlined />}
              size="middle"
              onClick={
                scopeView === "GLOBAL"
                  ? () => showNoPermission("Sửa khuyến mãi")
                  : canEditThis
                  ? () => goEdit(record.id)
                  : () => showNoPermission("Sửa khuyến mãi")
              }
              style={{
                background:
                  canEditThis && scopeView === "LOCAL"
                    ? "var(--primary-color, #627254)"
                    : "#d9d9d9",
                color: canEditThis && scopeView === "LOCAL" ? "#fff" : "#666",
                border: "none",
                height: 32,
                cursor:
                  canEditThis && scopeView === "LOCAL"
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              Sửa
            </Button>

            {/* Delete button */}
            <Button
              icon={<DeleteOutlined />}
              danger
              size="middle"
              onClick={
                scopeView === "LOCAL" && canDeleteThis
                  ? () =>
                      Modal.confirm({
                        title: "Xoá khuyến mãi?",
                        content:
                          "Bạn có chắc chắn muốn xoá khuyến mãi này không?",
                        okText: "Xoá",
                        cancelText: "Huỷ",
                        okButtonProps: { danger: true },
                        onOk: () => handleDelete(record.id),
                      })
                  : () => showNoPermission("Xoá khuyến mãi")
              }
              style={{
                background:
                  scopeView === "LOCAL" && canDeleteThis
                    ? "#ff4d4f"
                    : "#d9d9d9",
                color: scopeView === "LOCAL" && canDeleteThis ? "#fff" : "#666",
                border: "none",
                height: 32,
                cursor:
                  scopeView === "LOCAL" && canDeleteThis
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              Xoá
            </Button>
          </div>
        );
      },
    },
  ];

  // ===== TABS =====
  const tabItems = [
    { key: "all", label: `Tất cả (${tabCounts.all})` },
    { key: "active", label: `Đang hoạt động (${tabCounts.active})` },
    { key: "pending", label: `Chờ duyệt (${tabCounts.pending})` },
    { key: "expired", label: `Hết hạn (${tabCounts.expired})` },
  ];

  // ===== RENDER =====
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
                setTab("all"); // 🔁 reset về tab “Tất cả” khi đổi scope
              }}
              options={[
                { value: "LOCAL", label: "Khuyến mãi của đại lý" },
                { value: "GLOBAL", label: "Khuyến mãi" },
              ]}
              style={{ width: 240 }}
            />

            {/* Add button */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={
                scopeView === "LOCAL"
                  ? canCreate(role as Role, "LOCAL")
                    ? goCreate
                    : () => showNoPermission("Thêm khuyến mãi")
                  : () => showNoPermission("Thêm khuyến mãi")
              }
              style={{
                background:
                  scopeView === "LOCAL" && canCreate(role as Role, "LOCAL")
                    ? "var(--primary-color, #627254)"
                    : "#d9d9d9",
                border: "none",
                color:
                  scopeView === "LOCAL" && canCreate(role as Role, "LOCAL")
                    ? "#fff"
                    : "#666",
                cursor:
                  scopeView === "LOCAL" && canCreate(role as Role, "LOCAL")
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              Thêm khuyến mãi
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          items={tabItems}
        />

        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={
              scopeView === "GLOBAL"
                ? {
                    current: page,
                    pageSize: size,
                    total: globalData?.result?.metadata?.totalElements ?? 0,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                    onChange: (p, ps) => {
                      setPage(p);
                      setSize(ps);
                    },
                  }
                : false
            }
          />
        </Spin>
      </Card>
    </div>
  );
}
