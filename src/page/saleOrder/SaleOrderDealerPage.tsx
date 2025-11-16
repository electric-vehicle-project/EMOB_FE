// src/page/saleOrder/SaleOrderDealerPage.tsx
import { useState, useMemo } from "react";
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
import { SaleOrderDetailModal } from "../../components/organisms/saleOrder/SaleOrderDetailModal";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import { useDebounce } from "../../hook/useDebounce";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  { label: "Đã tạo", value: "CREATED" },
  { label: "Hoàn tất", value: "COMPLETED" },
  { label: "Đã huỷ", value: "CANCELED" },
];

const SORT_FIELDS = [
  { label: "Ngày tạo", value: "createdAt" },
  { label: "Tổng tiền", value: "totalPrice" },
  { label: "Tổng số lượng", value: "totalQuantity" },
];

const SORT_DIRS = [
  { label: "Tăng dần", value: "asc" },
  { label: "Giảm dần", value: "desc" },
];

type DealerRole = "MANAGER" | "DEALER_STAFF";

const SaleOrderDealerPage: React.FC = () => {
  const navigate = useNavigate();
  const role = useSelector((s: RootState) => s.user?.role as DealerRole);

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);
  const [statuses, setStatuses] = useState<OrderStatus[] | undefined>();

  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data, isLoading, isFetching, refetch } =
    useSaleOrderListCurrentDealer({
      page,
      size,
      keyword: debouncedKeyword,
      statuses,
      sortField,
      sortDir,
    });

  const orders: SaleOrderResponse[] = useMemo(
    () => data?.result?.data ?? data?.data ?? [],
    [data]
  );
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();

  const [detailId, setDetailId] = useState<string | null>(null);

  const filterContent = (
    <div className="flex flex-col gap-4">
      <div>
        <b>Trạng thái</b>
        <Select
          mode="multiple"
          className="w-full mt-2"
          allowClear
          placeholder="Trạng thái"
          value={statuses}
          options={STATUS_OPTIONS}
          onChange={(v: OrderStatus[]) => setStatuses(v.length ? v : undefined)}
        />
      </div>

      <div>
        <b>Sắp xếp theo</b>
        <Select
          className="w-full mt-2"
          value={sortField}
          options={SORT_FIELDS}
          onChange={(v: keyof SaleOrderResponse) => {
            setSortField(v);
            setPage(0);
          }}
        />
      </div>

      <div>
        <b>Thứ tự</b>
        <Select
          className="w-full mt-2"
          value={sortDir}
          options={SORT_DIRS}
          onChange={(v: "asc" | "desc") => {
            setSortDir(v);
            setPage(0);
          }}
        />
      </div>
    </div>
  );

  return (
    <CardWrapper
      title="Đơn hàng của đại lý"
      subtitle="Quản lý các đơn hàng thuộc đại lý hiện tại"
      variant="dashboard"
    >
      <div className="flex justify-end mb-4">
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

      <EMOBFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onReset={() => {
          setKeyword("");
          setStatuses(undefined);
          setSortField("createdAt");
          setSortDir("desc");
          setPage(0);
          setSize(10);
        }}
        filterDropdown={filterContent}
      />

      <SaleOrderTable
        data={orders}
        loading={isLoading || isFetching || canceling}
        onDelete={(id) => {
          setSelectedId(id);
          setConfirmOpen(true);
        }}
        onViewDetail={(id) => setDetailId(id)}
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
        onConfirm={async () => {
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
        }}
        loading={canceling}
      />

      <SaleOrderDetailModal
        open={!!detailId}
        orderId={detailId ?? undefined}
        onClose={() => setDetailId(null)}
      />
    </CardWrapper>
  );
};

export default SaleOrderDealerPage;
export { SaleOrderDealerPage };
