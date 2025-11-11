import { useMemo, useState } from "react";
import { Select, Input, Space, Button, message } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";
import {
  useSaleOrderListDealers,
  useSaleOrderComplete,
} from "../../service/saleOrderService";
import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";
import { useDebounce } from "../../hook/useDebounce";
import type { SelectProps } from "antd";

const STATUS_OPTIONS: SelectProps<OrderStatus[]>["options"] = [
  { label: "CREATED", value: "CREATED" as OrderStatus },
  { label: "COMPLETED", value: "COMPLETED" as OrderStatus },
  { label: "CANCELED", value: "CANCELED" as OrderStatus },
];

type EvmRole = "EVM_STAFF" | "ADMIN";

const SaleOrderEvmPage: React.FC = () => {
  const navigate = useNavigate();
  const role =
    (useSelector((s: RootState) => s.user?.role) as EvmRole) ?? "EVM_STAFF";

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
    useSaleOrderComplete();

  const handleViewDetail = (id: string) =>
    navigate(`/${role.toLowerCase()}/sale-order/${id}`);

  const handleCompleteClick = async (id: string) => {
    try {
      await completeOrder(id);
      message.success("Đã hoàn tất đơn hàng!");
      refetch();
    } catch {
      message.error("Không thể hoàn tất đơn hàng!");
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
          Quản lý đơn hàng của các đại lý
        </h2>
      </div>

      <div className="mb-4">
        <Space wrap size="middle">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã đơn / đại lý…"
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
        loading={isLoading || isFetching || completing}
        showDealerColumn
        onViewDetail={handleViewDetail}
        onComplete={handleCompleteClick}
        sortField={sortField}
        sortDir={sortDir}
        onSortChange={(f, o) => {
          setSortField(f);
          setSortDir(o);
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
