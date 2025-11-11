import { useMemo, useState } from "react";
import { Button, Input, Select, Space, message } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";
import {
  useSaleOrderListStaffCurrent,
  useSaleOrderDelete,
  useSaleOrderComplete,
} from "../../service/saleOrderService";
import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { SaleOrderCancelConfirm } from "../../components/organisms/saleOrder/SaleOrderCancelConfirm";
import { SaleOrderCompleteConfirm } from "../../components/organisms/saleOrder/SaleOrderCompleteConfirm";
import { useDebounce } from "../../hook/useDebounce";
import type { SelectProps } from "antd";

const STATUS_OPTIONS: SelectProps<OrderStatus[]>["options"] = [
  { label: "CREATED", value: "CREATED" as OrderStatus },
  { label: "COMPLETED", value: "COMPLETED" as OrderStatus },
  { label: "CANCELED", value: "CANCELED" as OrderStatus },
];

const SaleOrderStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const role = (useSelector((s: RootState) => s.user?.role) ??
    "DEALER_STAFF") as string;

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);
  const [statuses, setStatuses] = useState<OrderStatus[] | undefined>(
    undefined
  );
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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

  const orders: SaleOrderResponse[] = useMemo(
    () => data?.result?.data ?? data?.data ?? [],
    [data]
  );
  const totalElements = useMemo(
    () => data?.result?.metadata?.totalElements ?? 0,
    [data]
  );

  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { mutateAsync: cancelOrder, isPending: canceling } =
    useSaleOrderDelete();
  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderComplete();

  const confirmCancel = async () => {
    if (!selectedId) return;
    try {
      await cancelOrder(selectedId);
      message.success("Đã hủy đơn hàng thành công!");
      refetch();
    } catch {
      message.error("Không thể hủy đơn hàng!");
    } finally {
      setCancelOpen(false);
    }
  };

  const confirmComplete = async () => {
    if (!selectedId) return;
    try {
      await completeOrder(selectedId);
      message.success("Đã hoàn tất đơn hàng!");
      refetch();
    } catch {
      message.error("Không thể hoàn tất đơn hàng!");
    } finally {
      setCompleteOpen(false);
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

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Đơn hàng của nhân viên
        </h2>
        <Button
          onClick={() => navigate("/dealer_staff/sale-order")}
          type="primary"
          icon={<ArrowLeftOutlined />}
        >
          Quay lại đơn hàng của đại lý
        </Button>
      </div>

      <div className="mb-4">
        <Space wrap size="middle">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã đơn / ghi chú…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 320 }}
          />
          <Select<OrderStatus[]>
            allowClear
            mode="multiple"
            style={{ width: 320 }}
            placeholder="Trạng thái (chọn nhiều)"
            value={statuses}
            options={STATUS_OPTIONS}
            onChange={(vals) => {
              const v = (vals as OrderStatus[]) || [];
              setStatuses(v.length ? v : undefined);
              setPage(0);
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={resetFilters}
            type="primary"
          >
            Reset
          </Button>
        </Space>
      </div>

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
        onComplete={(id) => {
          setSelectedId(id);
          setCompleteOpen(true);
        }}
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
      <SaleOrderCompleteConfirm
        open={completeOpen}
        orderId={selectedId ?? undefined}
        onCancel={() => setCompleteOpen(false)}
        onConfirm={confirmComplete}
        loading={completing}
      />
    </CardWrapper>
  );
};

export default SaleOrderStaffPage;
export { SaleOrderStaffPage };
