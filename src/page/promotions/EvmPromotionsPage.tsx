import { useState, useMemo } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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
import { CardWrapper } from "../../components/template/CardWrapper";

const EvmPromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);

  const role: "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF" =
    user?.role ?? "EVM_STAFF";

  /* PAGINATION + SORT */
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* API */
  const { data, isLoading, isFetching, refetch } = usePromotionList(
    "GLOBAL",
    page,
    size,
    undefined,
    undefined,
    sortField,
    sortDir
  );

  const promotions: Promotion[] = useMemo(
    () => data?.result?.data ?? [],
    [data]
  );

  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  /* DELETE LOGIC */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  const { mutateAsync: deletePromotion, isPending } = usePromotionDelete();

  const handleDeleteClick = (id: string) => {
    const found = promotions.find((p) => p.id === id);
    if (!found) return;
    setSelectedPromotion(found);
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

  return (
    <CardWrapper>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khuyến mãi toàn hệ thống
        </h2>

        {(role === "ADMIN" || role === "EVM_STAFF") && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/${role.toLowerCase()}/promotions/create`)}
            className="!bg-[#627254] !border-[#627254] text-white hover:!bg-[#4f6f52]"
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
        onEdit={(id) =>
          navigate(`/${role.toLowerCase()}/promotions/edit/${id}`)
        }
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

export default EvmPromotionsPage;
export { EvmPromotionsPage };
