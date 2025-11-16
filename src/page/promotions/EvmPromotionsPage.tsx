// src/pages/promotion/EvmPromotionsPage.tsx
import { useState, useMemo } from "react";
import { Button, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import type { RootState } from "../../redux/store";
import type { Promotion } from "../../model/Promotion";

import {
  usePromotionList,
  usePromotionDelete,
} from "../../service/promotionService";

import { PromotionTable } from "../../components/organisms/promotion/PromotionTable";
import { PromotionDeleteConfirm } from "../../components/organisms/promotion/PromotionDeleteConfirm";
import { PromotionCreateModal } from "../../components/organisms/promotion/PromotionCreateModal";
import { PromotionDetailModal } from "../../components/organisms/promotion/PromotionDetailModal";
import PromotionEditModal from "../../components/organisms/promotion/PromotionEditModal";

import { CardWrapper } from "../../components/template/CardWrapper";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import { useDebounce } from "../../hook/useDebounce";

const STATUS_OPTIONS = [
  { label: "Sắp diễn ra", value: "UPCOMING" },
  { label: "Đang hiệu lực", value: "ACTIVE" },
  { label: "Không hoạt động", value: "INACTIVE" },
  { label: "Đã kết thúc", value: "EXPIRED" },
];

const EvmPromotionsPage: React.FC = () => {
  const user = useSelector((s: RootState) => s.user);
  const role =
    (user?.role as "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF") ??
    "EVM_STAFF";

  const canCreate = role === "EVM_STAFF";

  /* SEARCH */
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 350);

  /* FILTERS */
  const [status, setStatus] = useState<string | undefined>(undefined);

  /* SORT */
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* PAGINATION */
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  /* API */
  const { data, isLoading, isFetching, refetch } = usePromotionList(
    ["GLOBAL"],
    page,
    size,
    debouncedKeyword,
    status,
    sortField,
    sortDir
  );

  const promotions: Promotion[] = useMemo(
    () => data?.result?.data ?? [],
    [data]
  );

  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  /* DELETE */
  const [deleteId, setDeleteId] = useState<string>();
  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePromotion(deleteId);
      toast.success("Đã xoá khuyến mãi thành công");
      refetch();
    } catch {
      toast.error("Không thể xoá khuyến mãi này");
    } finally {
      setDeleteId(undefined);
    }
  };

  /* MODALS */
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<string>();
  const [detailId, setDetailId] = useState<string>();

  /* RESET FILTER */
  const handleReset = () => {
    setKeyword("");
    setStatus(undefined);
    setSortField("createAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
    refetch();
  };

  return (
    <CardWrapper title="Khuyến mãi toàn hệ thống" variant="dashboard">
      <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
        <EMOBFilterBar
          keyword={keyword}
          onKeywordChange={(v) => {
            setKeyword(v);
            setPage(0);
          }}
          onReset={handleReset}
          filterDropdown={
            <div className="flex flex-col gap-4 w-full">
              {/* Status */}
              <div>
                <div className="font-medium mb-1">Trạng thái</div>
                <Select
                  allowClear
                  value={status}
                  className="w-full"
                  options={STATUS_OPTIONS}
                  placeholder="Chọn trạng thái"
                  onChange={(v) => {
                    setStatus(v || undefined);
                    setPage(0);
                  }}
                />
              </div>

              {/* Sort field */}
              <div>
                <div className="font-medium mb-1">Sắp xếp theo</div>
                <Select
                  className="w-full"
                  value={sortField}
                  onChange={(v) => {
                    setSortField(v);
                    setPage(0);
                  }}
                >
                  <Select.Option value="createAt">Ngày tạo</Select.Option>
                  <Select.Option value="startDate">Ngày bắt đầu</Select.Option>
                  <Select.Option value="name">Tên chương trình</Select.Option>
                  <Select.Option value="value">Giá trị</Select.Option>
                </Select>
              </div>

              {/* Sort dir */}
              <div>
                <div className="font-medium mb-1">Thứ tự</div>
                <Select
                  className="w-full"
                  value={sortDir}
                  onChange={(v) => {
                    setSortDir(v);
                    setPage(0);
                  }}
                >
                  <Select.Option value="asc">Tăng dần</Select.Option>
                  <Select.Option value="desc">Giảm dần</Select.Option>
                </Select>
              </div>
            </div>
          }
        />

        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
            className="text-white !bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52]"
          >
            Tạo khuyến mãi
          </Button>
        )}
      </div>

      {/* TABLE */}
      <PromotionTable
        data={promotions}
        loading={isLoading || isFetching}
        role={role}
        onEdit={(id) => setEditId(id)}
        onDelete={(id) => setDeleteId(id)}
        onView={(id) => setDetailId(id)}
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

      {/* MODALS */}
      <PromotionCreateModal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          refetch();
        }}
      />

      <PromotionEditModal
        open={!!editId}
        promotionId={editId}
        onClose={() => setEditId(undefined)}
        onSuccess={refetch}
      />

      <PromotionDetailModal
        open={!!detailId}
        promotionId={detailId}
        onClose={() => setDetailId(undefined)}
      />

      <PromotionDeleteConfirm
        open={!!deleteId}
        promotionName={promotions.find((p) => p.id === deleteId)?.name ?? ""}
        onCancel={() => setDeleteId(undefined)}
        onConfirm={handleConfirmDelete}
        loading={isPending}
      />
    </CardWrapper>
  );
};

export default EvmPromotionsPage;
export { EvmPromotionsPage };
