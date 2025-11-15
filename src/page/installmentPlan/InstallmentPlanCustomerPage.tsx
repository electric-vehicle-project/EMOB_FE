import { useState, useMemo, useEffect, useCallback } from "react";
import { Result, Button, Empty, Input } from "antd";
import { useDebounce } from "../../hook/useDebounce";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { useInstallmetnPlanByCustomersQuery } from "../../service/installmentPlanService";
import type {
  IInstallmentPlan,
  InstallmentPlanApiModel,
} from "../../model/InstallmentPlan";
import { InstallmentPlanTable } from "../../components/molecules/installmentPlan/InstallmentPlanTable";
import { InstallmentPlanDetailModal } from "./ViewInstallmentPlanCustomerModal";
import { CardWrapper } from "../../components/template/CardWrapper";

export const InstallmentPlanCustomersPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";
  const canView = role === "DEALER_STAFF" || role === "MANAGER";

  useEffect(() => {
    setCurrent(1);
  }, [debouncedSearch]);

  const params = useMemo(
    () => ({
      page: current - 1,
      size: pageSize,
      keyword: debouncedSearch || undefined,
      sortField: "downDate",
      sortDir: "desc",
    }),
    [current, pageSize, debouncedSearch]
  );

  const isDealerRole = role === "DEALER_STAFF" || role === "MANAGER";
  const customerPlansQuery = useInstallmetnPlanByCustomersQuery(
    { enabled: canView && isDealerRole },
    params
  );

  const { data, refetch, isLoading, isError, error } = isDealerRole
    ? customerPlansQuery
    : {
        data: [],
        refetch: () => {},
        isLoading: false,
        isError: false,
        error: null,
      };

  const installmentPlans: IInstallmentPlan[] = useMemo(() => {
    const raw: InstallmentPlanApiModel[] = data?.result?.data ?? [];
    return raw.map((plan) => ({
      id: plan.id,
      downDate: plan.downDate,
      deposit: plan.deposit,
      totalAmount: plan.totalAmount,
      monthlyAmount: plan.monthlyAmount,
      interestRate: plan.interestRate,
      termMonths: plan.termMonths,
      nextDueDate: plan.nextDueDate,
      status: plan.status,
    }));
  }, [data]);

  const total = data?.result?.metadata?.totalElements ?? 0;

  const handleViewDetail = useCallback((id: string) => {
    setSelectedId(id);
    setIsModalOpen(true);
  }, []);

  if (!canView)
    return (
      <CardWrapper
        title="Quản lý kế hoạch trả góp khách hàng"
        subtitle="Bạn không có quyền truy cập trang này"
        variant="dashboard"
      >
        <Result
          status="403"
          title="403"
          subTitle="Bạn không có quyền truy cập trang này."
          extra={
            <Button type="primary" href="/dashboard">
              Về trang tổng quan
            </Button>
          }
        />
      </CardWrapper>
    );

  if (isError)
    return (
      <CardWrapper
        title="Quản lý kế hoạch trả góp khách hàng"
        subtitle="Không thể tải danh sách kế hoạch trả góp"
        variant="dashboard"
      >
        <Result
          status="error"
          title="Không thể tải danh sách kế hoạch trả góp"
          subTitle={
            (error as { message?: string })?.message || "Vui lòng thử lại."
          }
          extra={
            <Button type="primary" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </CardWrapper>
    );

  return (
    <CardWrapper
      title="Quản lý kế hoạch trả góp khách hàng"
      subtitle="Theo dõi, tìm kiếm và xem chi tiết kế hoạch trả góp của khách hàng"
      variant="dashboard"
    >
      <div className="flex justify-end mb-4">
        <Input
          placeholder="Tìm kiếm kế hoạch trả góp..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
          className="rounded-md shadow-sm border-gray-300 focus:border-green-600 focus:ring-green-600"
        />
      </div>

      {installmentPlans.length > 0 ? (
        <InstallmentPlanTable
          data={installmentPlans}
          isLoading={isLoading}
          onViewDetail={handleViewDetail}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setCurrent(p);
              setPageSize(s || pageSize);
            },
            showTotal: (t) => `Tổng ${t} kế hoạch trả góp`,
          }}
        />
      ) : (
        <Empty description="Không có dữ liệu" />
      )}

      <InstallmentPlanDetailModal
        id={selectedId}
        open={isModalOpen}
        onClose={() => {
          setSelectedId(null);
          setIsModalOpen(false);
        }}
      />
    </CardWrapper>
  );
};
