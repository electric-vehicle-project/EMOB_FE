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
import { CardWrapper } from "../../components/template/CardWrapper";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import { useDebounce } from "../../hook/useDebounce";
import PromotionEditModal from "../../components/organisms/promotion/PromotionEditModal";

type Role = "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF";

const STATUS_OPTIONS = [
  { label: "Sắp diễn ra", value: "UPCOMING" },
  { label: "Đang hiệu lực", value: "ACTIVE" },
  { label: "Không hoạt động", value: "INACTIVE" },
  { label: "Đã kết thúc", value: "EXPIRED" },
];

const DealerPromotionsPage: React.FC = () => {
  const user = useSelector((s: RootState) => s.user);

  const rawRole = user?.role;
  const role: Role =
    rawRole === "ADMIN" ||
    rawRole === "EVM_STAFF" ||
    rawRole === "MANAGER" ||
    rawRole === "DEALER_STAFF"
      ? rawRole
      : "DEALER_STAFF";

  const userDealerId = user?.dealerId;
  const isDealerStaff = role === "DEALER_STAFF";
  const canCreate = isDealerStaff;

  // Search
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 350);

  // Filters
  const [scope, setScope] = useState<string[]>(["LOCAL"]);
  const [status, setStatus] = useState<string[]>([]);

  // Sort
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // API
  const { data, isLoading, isFetching, refetch } = usePromotionList(
    scope,
    page,
    size,
    debouncedKeyword,
    status.length ? status : undefined,
    sortField,
    sortDir
  );

  const promotions: Promotion[] = useMemo(
    () => data?.result?.data ?? [],
    [data]
  );

  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  // MODALS
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleEdit = (id: string) => {
    const target = promotions.find((p) => p.id === id) || null;
    setSelectedPromotion(target);
    setEditOpen(true);
  };

  const handleDetail = (id: string) => {
    const target = promotions.find((p) => p.id === id) || null;
    setSelectedPromotion(target);
    setDetailOpen(true);
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
      toast.success("Đã xoá khuyến mãi thành công");
      refetch();
    } catch {
      toast.error("Không thể xoá khuyến mãi này");
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setScope(["LOCAL"]);
    setStatus([]);
    setSortField("createAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
    refetch();
  };

  return (
    <>
      <PromotionCreateModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          refetch();
        }}
      />

      <PromotionEditModal
        open={editOpen}
        promotionId={selectedPromotion?.id}
        onClose={() => {
          setEditOpen(false);
          refetch();
        }}
      />

      <PromotionDetailModal
        open={detailOpen}
        promotionId={selectedPromotion?.id}
        onClose={() => setDetailOpen(false)}
      />

      <CardWrapper
        title="Quản lý khuyến mãi"
        subtitle="Theo dõi và quản lý chương trình khuyến mãi áp dụng cho đại lý"
        variant="dashboard"
      >
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
                {/* Scope */}
                <div>
                  <div className="font-medium mb-1">Phạm vi</div>
                  <Select
                    mode="multiple"
                    allowClear
                    value={scope}
                    className="w-full"
                    options={[
                      { label: "Toàn hệ thống", value: "GLOBAL" },
                      { label: "Đại lý", value: "LOCAL" },
                    ]}
                    onChange={(v) => {
                      setScope(v.length ? v : ["LOCAL"]);
                      setPage(0);
                    }}
                  />
                </div>

                {/* Status */}
                <div>
                  <div className="font-medium mb-1">Trạng thái</div>
                  <Select
                    mode="multiple"
                    allowClear
                    value={status}
                    className="w-full"
                    options={STATUS_OPTIONS}
                    placeholder="Chọn trạng thái"
                    onChange={(v) => {
                      setStatus(v);
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
                    <Select.Option value="startDate">
                      Ngày bắt đầu
                    </Select.Option>
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
              onClick={handleCreate}
              className="text-white !bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52]"
            >
              Tạo khuyến mãi
            </Button>
          )}
        </div>

        <PromotionTable
          data={promotions}
          loading={isLoading || isFetching}
          role={role}
          userDealerId={userDealerId}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleDetail}
          onChangeSort={(field) => {
            if (field === "status") {
              setSortField("status");
              setSortDir("asc");
              setPage(0);
            }
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
    </>
  );
};

export default DealerPromotionsPage;
export { DealerPromotionsPage };
