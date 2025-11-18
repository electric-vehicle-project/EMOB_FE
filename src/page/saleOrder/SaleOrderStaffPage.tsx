import { useMemo, useState } from "react";
import { Button, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrderListStaffCurrent,
  useSaleOrderDelete,
  useSaleOrderCompleteDirect,
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

const SaleOrderStaffPage: React.FC = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);

  const [statuses, setStatuses] = useState<OrderStatus[] | undefined>();
  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data, isLoading, isFetching, refetch } = useSaleOrderListStaffCurrent(
    {
      page,
      size,
      keyword: debouncedKeyword,
      statuses,
      sortField,
      sortDir,
    }
  );

  const orders = useMemo<SaleOrderResponse[]>(
    () => data?.result?.data ?? data?.data ?? [],
    [data]
  );
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();
  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderCompleteDirect();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [detailId, setDetailId] = useState<string | null>(null);

  const confirmCancel = async () => {
    if (!selectedId) return;
    try {
      await cancelOrder(selectedId);
      toast.success("Đã hủy đơn hàng thành công!");
      refetch();
    } catch {
      toast.error("Không thể hủy đơn hàng!");
    } finally {
      setCancelOpen(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeOrder(id);
      refetch();
    } catch {
      /* empty */
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setStatuses(undefined);
    setSortField("createdAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
  };

  const filterContent = (
    <div className="flex flex-col gap-4">
      <div>
        <b>Trạng thái</b>
        <Select
          mode="multiple"
          allowClear
          className="w-full mt-2"
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
      title="Đơn hàng của nhân viên"
      subtitle="Theo dõi các đơn hàng do nhân viên phụ trách"
      variant="dashboard"
    >
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dealer_staff/sale-order")}
        >
          Quay lại đơn hàng của đại lý
        </Button>
      </div>

      <EMOBFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onReset={resetFilters}
        filterDropdown={filterContent}
      />

      <SaleOrderTable
        data={orders}
        loading={isLoading || isFetching || canceling || completing}
        onDelete={(id) => {
          setSelectedId(id);
          setCancelOpen(true);
        }}
        onComplete={handleComplete}
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
        open={cancelOpen}
        orderId={selectedId ?? undefined}
        onCancel={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
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

export default SaleOrderStaffPage;
export { SaleOrderStaffPage };
