import { useState, useMemo, useEffect } from "react";
import { Select, message } from "antd";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

import type { SaleOrderResponse, OrderStatus } from "../../model/SaleOrder";
import {
  useSaleOrderListDealers,
  useSaleOrderComplete,
} from "../../service/saleOrderService";
import { useGetAccountsByManager } from "../../service/accountService";
import { mapDealerOptionsFromAccounts } from "../../utils/mapToSelectOptions";

import { CardWrapper } from "../../components/template/CardWrapper";
import { SaleOrderFilterBar } from "../../components/organisms/saleOrder/SaleOrderFilterBar";
import { SaleOrderTable } from "../../components/organisms/saleOrder/SaleOrderTable";

// Kiểu role dành cho nhân viên EVM
type EvmRole = "EVM_STAFF" | "ADMIN";

const SaleOrderEvmPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const role = (user?.role as EvmRole) ?? "EVM_STAFF";

  // Trạng thái filter và sort
  const [dealerId, setDealerId] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [sortField, setSortField] =
    useState<keyof SaleOrderResponse>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Danh sách đại lý (account)
  const { data: accountData } = useGetAccountsByManager(0, 50, {
    enabled: true,
  });
  const dealerOptions = mapDealerOptionsFromAccounts(accountData ?? []);

  // Tham số truy vấn API
  const params = useMemo(() => {
    const statuses = statusFilter === "ALL" ? undefined : [statusFilter];
    return { page: 0, size: 10, keyword: "", statuses, sortField, sortDir };
  }, [statusFilter, sortField, sortDir]);

  // Lấy dữ liệu đơn hàng
  const { data, isLoading, isFetching, refetch, error } =
    useSaleOrderListDealers(params);

  const allOrders = useMemo<SaleOrderResponse[]>(() => {
    return data?.result?.data ?? data?.data ?? [];
  }, [data]);

  // Lọc theo đại lý được chọn
  const orders = useMemo(() => {
    if (!dealerId) return allOrders;
    return allOrders.filter((o) => o.dealerId === dealerId);
  }, [allOrders, dealerId]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId, statusFilter, sortField, sortDir]);

  // Đếm trạng thái đơn hàng
  const statusCounts = useMemo(() => {
    const counts = { all: 0, created: 0, completed: 0, canceled: 0 };
    for (const o of orders) {
      counts.all++;
      if (o.status === "CREATED") counts.created++;
      else if (o.status === "COMPLETED") counts.completed++;
      else if (o.status === "CANCELED") counts.canceled++;
    }
    return counts;
  }, [orders]);

  // Hoàn tất đơn hàng
  const { mutateAsync: completeOrder, isPending: completing } =
    useSaleOrderComplete();

  const handleViewDetail = (id: string) => {
    const base = `/${role.toLowerCase()}`;
    navigate(`${base}/sale-order/${id}`);
  };

  const handleCompleteClick = async (id: string) => {
    try {
      await completeOrder(id);
      message.success("Đã hoàn tất đơn hàng!");
      refetch();
    } catch {
      message.error("Không thể hoàn tất đơn hàng!");
    }
  };

  if (error) message.error("Không thể tải dữ liệu đơn hàng của đại lý!");

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Quản lý đơn hàng của các đại lý
        </h2>
        <Select
          placeholder="Chọn đại lý"
          style={{ width: 250 }}
          allowClear
          options={dealerOptions}
          onChange={(value) => setDealerId(value || undefined)}
        />
      </div>

      <SaleOrderFilterBar
        counts={statusCounts}
        defaultStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <SaleOrderTable
        key={`orders-${dealerId}-${statusFilter}-${sortField}-${sortDir}`}
        data={orders}
        loading={isLoading || isFetching || completing}
        showDealerColumn
        onViewDetail={handleViewDetail}
        onComplete={handleCompleteClick}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortDir(order);
        }}
      />
    </CardWrapper>
  );
};

export default SaleOrderEvmPage;
export { SaleOrderEvmPage };
