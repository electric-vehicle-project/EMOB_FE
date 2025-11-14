import { useState } from "react";
import { Button, Input, Select, Space, message } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
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
import { useDebounce } from "../../hook/useDebounce";
import type { SelectProps } from "antd";
import { toast } from "react-toastify";

const STATUS_OPTIONS: SelectProps<OrderStatus[]>["options"] = [
  { label: "CREATED", value: "CREATED" as OrderStatus },
  { label: "COMPLETED", value: "COMPLETED" as OrderStatus },
  { label: "CANCELED", value: "CANCELED" as OrderStatus },
];

type DealerRole = "MANAGER" | "DEALER_STAFF";

const SaleOrderDealerPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);
  const role = (user?.role as DealerRole) ?? "DEALER_STAFF";

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

  const { data, isLoading, isFetching, refetch } =
    useSaleOrderListCurrentDealer({
      page,
      size,
      keyword: debouncedKeyword,
      statuses,
      sortField,
      sortDir,
    });

  const orders = data?.result?.data ?? data?.data ?? [];
  const totalElements = data?.result?.metadata?.totalElements ?? 0;

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Đơn hàng của đại lý
        </h2>
        {role === "MANAGER" ? (
          <Button
            onClick={() => navigate("/manager/sale-order/staff-summary")}
            type="primary"
          >
            Xem doanh số theo nhân viên
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/dealer_staff/sale-order/staff")}
            type="primary"
          >
            Xem đơn hàng của tôi
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Space wrap size="middle">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã đơn / đại lý / ghi chú…"
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
