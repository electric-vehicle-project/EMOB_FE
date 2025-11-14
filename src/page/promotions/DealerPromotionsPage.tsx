import { useState, useMemo } from "react";
import { Button, Input, Select, Space } from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { Promotion } from "../../model/Promotion";
import {
  usePromotionList,
  usePromotionDelete,
} from "../../service/promotionService";
import { PromotionTable } from "../../components/organisms/promotion/PromotionTable";
import { PromotionDeleteConfirm } from "../../components/organisms/promotion/PromotionDeleteConfirm";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useDebounce } from "../../hook/useDebounce";

const STATUS_OPTIONS = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "UPCOMING", value: "UPCOMING" },
  { label: "EXPIRED", value: "EXPIRED" },
  { label: "INACTIVE", value: "INACTIVE" },
];

export const DealerPromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);
  const role =
    (user?.role as "MANAGER" | "DEALER_STAFF" | "ADMIN" | "EVM_STAFF") ??
    "DEALER_STAFF";

  const [scope, setScope] = useState<string[]>(["LOCAL"]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const debouncedKeyword = useDebounce(keyword, 400);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isFetching, refetch } = usePromotionList(
    scope,
    page,
    size,
    debouncedKeyword,
    status,
    sortField,
    sortDir
  );

  const promotions: Promotion[] = useMemo(
    () => (data?.result?.data as Promotion[]) ?? [],
    [data]
  );
  const totalElements = useMemo(
    () => data?.result?.metadata?.totalElements ?? 0,
    [data]
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();

  const handleCreate = () => {
    navigate(`/${role.toLowerCase()}/promotions/create`);
  };

  const handleEdit = (id: string) => {
    navigate(`/${role.toLowerCase()}/promotions/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    const target = promotions.find((p) => p.id === id);
    if (!target) return;
    setSelectedPromotion(target);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPromotion) return;
    try {
      await deletePromotion(selectedPromotion.id);
      toast.success("Đã xoá khuyến mãi thành công!");
      refetch();
    } catch {
      toast.error("Không thể xoá khuyến mãi này!");
    } finally {
      setConfirmOpen(false);
    }
  };

  const resetFilters = () => {
    setScope(["LOCAL"]);
    setKeyword("");
    setStatus(undefined);
    setSortField("createAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
    refetch();
  };

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khuyến mãi của đại lý
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="!bg-[#627254] !border-[#627254] text-white hover:!bg-[#4f6f52]"
        >
          Tạo khuyến mãi
        </Button>
      </div>

      {/* --- Filter bar --- */}
      <div className="mb-4">
        <Space wrap size="middle">
          <Select
            allowClear
            mode="multiple"
            style={{ width: 300 }}
            placeholder="Phạm vi áp dụng"
            value={scope}
            options={[
              { label: "Toàn hệ thống (GLOBAL)", value: "GLOBAL" },
              { label: "Cục bộ (LOCAL)", value: "LOCAL" },
            ]}
            onChange={(vals) => {
              setScope(vals.length ? vals : ["LOCAL"]);
              setPage(0);
            }}
          />
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên khuyến mãi..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            allowClear
            style={{ width: 240 }}
            placeholder="Trạng thái"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(val) => {
              setStatus(val);
              setPage(0);
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={resetFilters}
            type="primary"
          >
            Reset
          </Button>
        </Space>
      </div>

      <PromotionTable
        data={promotions}
        loading={isLoading || isFetching}
        role={role}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        sortField={sortField}
        sortDir={sortDir}
        onChangeSort={(field, order) => {
          setSortField(field || "createAt");
          setSortDir(order === "ascend" ? "asc" : "desc");
          setPage(0);
        }}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: totalElements,
          showSizeChanger: true,
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s ?? 10);
          },
          position: ["bottomCenter"],
          showTotal: (t) => `Tổng cộng ${t} khuyến mãi`,
        }}
      />

      <PromotionDeleteConfirm
        open={confirmOpen}
        promotionName={selectedPromotion?.name}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isPending}
      />
    </CardWrapper>
  );
};

export default DealerPromotionsPage;
