import { useMemo, useState } from "react";
import { Select } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrderListDealers,
  useSaleOrderCompleteDirect,
} from "../../service/saleOrderService";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import { useDebounce } from "../../hook/useDebounce";

const STATUS_OPTIONS = [
  { label: "Đã tạo", value: "CREATED" as OrderStatus },
  { label: "Hoàn tất", value: "COMPLETED" as OrderStatus },
  { label: "Đã huỷ", value: "CANCELED" as OrderStatus },
];

type EvmRole = "EVM_STAFF" | "ADMIN";

const SaleOrderEvmPage: React.FC = () => {
  const navigate = useNavigate();
  const role =
    (useSelector((s: RootState) => s.user?.role) as EvmRole) ?? "EVM_STAFF";

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
  const { data, isLoading, isFetching, refetch } = useSaleOrderListDealers({
    page,
    size,
    keyword: debouncedKeyword,
    statuses,
    sortField,
    sortDir,
  });

  const orders = useMemo<SaleOrderResponse[]>(
    () => data?.result?.data ?? data?.data ?? [],
    [data]
  );

  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderCompleteDirect();

  const handleComplete = async (id: string) => {
    try {
      await completeOrder(id);
      refetch();
    } catch {
      /* onError handled in hook */
    }
  };

  const handleViewDetail = (id: string) =>
    navigate(`/${role.toLowerCase()}/sale-order/${id}`);

  const resetFilters = () => {
    setKeyword("");
    setStatuses(undefined);
    setSortField("createdAt");
    setSortDir("desc");
    setPage(0);
    setSize(10);
  };

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quản lý đơn hàng của các đại lý
        </h2>
      </div>

      {/* EMOB Filter Bar */}
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

      {/* Table */}
      <SaleOrderTable
        data={orders}
        loading={isLoading || isFetching || completing}
        showDealerColumn
        onViewDetail={handleViewDetail}
        onComplete={handleComplete}
        sortField={sortField}
        sortDir={sortDir}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortDir(order);
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
          showTotal: (t) => `Tổng cộng ${t} đơn hàng`,
        }}
      />
    </CardWrapper>
  );
};

export default SaleOrderEvmPage;
export { SaleOrderEvmPage };
