import { useState, useMemo } from "react";
import { Button, Select } from "antd";
import { toast } from "react-toastify";
import { PlusOutlined } from "@ant-design/icons";
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
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";

export const DealerPromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);

  const role: "ADMIN" | "EVM_STAFF" | "MANAGER" | "DEALER_STAFF" =
    user?.role === "ADMIN" ||
    user?.role === "EVM_STAFF" ||
    user?.role === "MANAGER" ||
    user?.role === "DEALER_STAFF"
      ? user.role
      : "DEALER_STAFF";

  const [scope, setScope] = useState<string[]>(["LOCAL"]);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isFetching, refetch } = usePromotionList(
    scope,
    page,
    size,
    "", // không search
    undefined, // không filter trạng thái
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
      toast.success("Đã xoá khuyến mãi thành công");
      refetch();
    } catch {
      toast.error("Không thể xoá khuyến mãi này");
    } finally {
      setConfirmOpen(false);
    }
  };

  const resetFilters = () => {
    setScope(["LOCAL"]);
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

      <EMOBFilterBar
        onReset={resetFilters}
        filterDropdown={
          <div className="flex flex-col gap-4">
            <Select
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="Phạm vi áp dụng"
              value={scope}
              options={[
                { label: "Toàn hệ thống", value: "GLOBAL" },
                { label: "Đại lý", value: "LOCAL" },
              ]}
              onChange={(val) => {
                setScope(val.length ? val : ["LOCAL"]);
                setPage(0);
              }}
            />
          </div>
        }
      />

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
