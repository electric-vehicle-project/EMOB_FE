import { useState } from "react";
import { Button, Select } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrderListCurrentDealer,
  useSaleOrderDelete,
} from "../../service/saleOrderService";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { SaleOrderCancelConfirm } from "../../components/organisms/saleOrder/SaleOrderCancelConfirm";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import { useDebounce } from "../../hook/useDebounce";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  { label: "Đã tạo", value: "CREATED" as OrderStatus },
  { label: "Hoàn tất", value: "COMPLETED" as OrderStatus },
  { label: "Đã huỷ", value: "CANCELED" as OrderStatus },
];

type DealerRole = "MANAGER" | "DEALER_STAFF";

const SaleOrderDealerPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);
  const role = (user?.role as DealerRole) ?? "DEALER_STAFF";

  // Search + Filter
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);

  const [statuses, setStatuses] = useState<OrderStatus[] | undefined>(
    undefined
  );

  // Pagination + Sort
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // API
  const { data, isLoading, isFetching, refetch } =
    useSaleOrderListCurrentDealer({
      page,
      size,
      keyword: debouncedKeyword,
      statuses,
      sortField,
      sortDir,
    });

  const orders: SaleOrderResponse[] = data?.result?.data ?? data?.data ?? [];

  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  // Cancel logic
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await cancelOrder(selectedId);
      toast.success("Đã hủy đơn hàng thành công!");
      refetch();
    } catch {
      toast.error("Không thể hủy đơn hàng này!");
    } finally {
      setConfirmOpen(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setKeyword("");
    setStatuses(undefined);
    setSortField("createdAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
  };

  const handleViewDetail = (id: string) => {
    const base = `/${role.toLowerCase()}`;
    navigate(`${base}/sale-order/${id}`);
  };

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Đơn hàng của đại lý
        </h2>

        {role === "MANAGER" ? (
          <Button
            type="primary"
            onClick={() => navigate("/manager/sale-order/staff-summary")}
          >
            Xem doanh số theo nhân viên
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={() => navigate("/dealer_staff/sale-order/staff")}
          >
            Xem đơn hàng của tôi
          </Button>
        )}
      </div>

      {/* FILTER BAR (EMOB) */}
      <EMOBFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onReset={resetFilters}
        filterDropdown={
          <div className="flex flex-col gap-4">
            <Select<OrderStatus[]>
              mode="multiple"
              allowClear
              className="w-full"
              placeholder="Trạng thái"
              value={statuses}
              options={STATUS_OPTIONS}
              onChange={(vals) => setStatuses(vals.length ? vals : undefined)}
            />
          </div>
        }
      />

      {/* TABLE */}
      <SaleOrderTable
        data={orders}
        loading={isLoading || isFetching || canceling}
        sortField={sortField}
        sortDir={sortDir}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortDir(order);
          setPage(0);
        }}
        onDelete={handleDeleteClick}
        onViewDetail={handleViewDetail}
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
          showTotal: (t) => `Tổng cộng ${t} đơn hàng`,
        }}
      />

      <SaleOrderCancelConfirm
        open={confirmOpen}
        orderId={selectedId ?? undefined}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={canceling}
      />
    </CardWrapper>
  );
};

export default SaleOrderDealerPage;
export { SaleOrderDealerPage };
