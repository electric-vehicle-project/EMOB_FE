import { useMemo, useState } from "react";
import { Select } from "antd";
import { toast } from "react-toastify";

import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrderListDealers,
  useSaleOrderCompleteDirect,
} from "../../service/saleOrderService";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { SaleOrderDetailModal } from "../../components/organisms/saleOrder/SaleOrderDetailModal";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import { useDebounce } from "../../hook/useDebounce";

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

const SaleOrderEvmPage: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);

  const [statuses, setStatuses] = useState<OrderStatus[] | undefined>();
  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data, isLoading, isFetching, refetch } = useSaleOrderListDealers({
    page,
    size,
    keyword: debouncedKeyword,
    statuses,
    sortField,
    sortDir,
  });

  const { mutateAsync: completeOrder } = useSaleOrderCompleteDirect();

  const orders = useMemo(() => data?.result?.data ?? data?.data ?? [], [data]);
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

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
          onChange={(v) => setStatuses(v.length ? v : undefined)}
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
      title="Quản lý đơn hàng của các đại lý"
      subtitle="Theo dõi toàn bộ đơn hàng trong hệ thống"
      variant="dashboard"
    >
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
        loading={isLoading || isFetching}
        showDealerColumn
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
        onViewDetail={(id) => setDetailId(id)}
        onComplete={async (id) => {
          try {
            await completeOrder(id);
            toast.success("Đã hoàn tất đơn hàng");
            refetch();
          } catch {
            toast.error("Không thể hoàn tất đơn hàng");
          }
        }}
      />

      <SaleOrderDetailModal
        disableActions
        open={!!detailId}
        orderId={detailId ?? undefined}
        onClose={() => setDetailId(null)}
      />
    </CardWrapper>
  );
};

export default SaleOrderEvmPage;
export { SaleOrderEvmPage };
