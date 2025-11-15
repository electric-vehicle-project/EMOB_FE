// src/page/saleOrder/SaleOrderStaffPage.tsx
import { useMemo, useState } from "react";
import { Button, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";

import {
  useSaleOrderListStaffCurrent,
  useSaleOrderDelete,
  useSaleOrderCompleteDirect,
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

const SaleOrderStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const role = (useSelector((s: RootState) => s.user?.role) ??
    "DEALER_STAFF") as string;

  // Search + Filter state
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

  // Cancel
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

  // Complete
  const handleComplete = async (id: string) => {
    try {
      await completeOrder(id);
      refetch();
    } catch {
      /* handled elsewhere */
    }
  };

  // Reset all filters
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
      {/* STATUS FILTER */}
      <div>
        <b className="text-gray-700">Trạng thái</b>
        <Select<OrderStatus[]>
          mode="multiple"
          allowClear
          className="w-full mt-2"
          placeholder="Trạng thái"
          options={STATUS_OPTIONS}
          value={statuses}
          onChange={(v) => setStatuses(v.length ? v : undefined)}
        />
      </div>

      {/* SORT FIELD */}
      <div>
        <b className="text-gray-700">Sắp xếp theo</b>
        <Select
          className="w-full mt-2"
          value={sortField}
          onChange={(v) => {
            setSortField(v);
            setPage(0);
          }}
        >
          <Select.Option value="createdAt">Ngày tạo</Select.Option>
          <Select.Option value="totalPrice">Tổng tiền</Select.Option>
          <Select.Option value="totalQuantity">Tổng số lượng</Select.Option>
        </Select>
      </div>

      {/* SORT DIRECTION */}
      <div>
        <b className="text-gray-700">Thứ tự</b>
        <Select
          className="w-full mt-2"
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
  );

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Đơn hàng của nhân viên
        </h2>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dealer_staff/sale-order")}
        >
          Quay lại đơn hàng của đại lý
        </Button>
      </div>

      {/* Filter Bar */}
      <EMOBFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onReset={resetFilters}
        filterDropdown={filterContent}
      />

      {/* Table */}
      <SaleOrderTable
        data={orders}
        loading={isLoading || isFetching || canceling || completing}
        sortField={sortField}
        sortDir={sortDir}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortDir(order);
          setPage(0);
        }}
        onDelete={(id) => {
          setSelectedId(id);
          setCancelOpen(true);
        }}
        onComplete={handleComplete}
        onViewDetail={(id) =>
          navigate(`/${role.toLowerCase()}/sale-order/${id}`)
        }
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
    </CardWrapper>
  );
};

export default SaleOrderStaffPage;
export { SaleOrderStaffPage };
