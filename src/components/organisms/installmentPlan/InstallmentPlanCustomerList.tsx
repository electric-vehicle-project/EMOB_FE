import { useState, useMemo, useEffect } from "react";
import { Result, Button, Empty, Input } from "antd";
import type { IInstallmentPlan } from "../../../model/InstallmentPlan";
import { SearchBar } from "../../molecules/SearchBar";
import { useDebounce } from "../../../hook/useDebounce";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import { useInstallmetnPlanByCustomersQuery } from "../../../service/installmentPlanService";
import { InstallmentPlanTable } from "../../molecules/installmentPlan/InstallmentPlanTable";
import type { InstallmentPlanApiModel } from "../../../model/InstallmentPlan";

export const InstallmentPlanCustomerList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";
  const canView = role === "DEALER_STAFF" || role === "MANAGER";

  // Reset về trang 1 khi search thay đổi
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

  // Logic: DEALER_STAFF và MANAGER xem kế hoạch của dealer hiện tại
  // ADMIN và EVM_STAFF xem tất cả kế hoạch
  const isDealerRole = role === "DEALER_STAFF" || role === "MANAGER";
  const customerPlansQuery = useInstallmetnPlanByCustomersQuery(
    { enabled: canView && isDealerRole },
    params
  );

  // Chọn query result dựa trên role
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

  const handleMarkAsPaid = (id: string) => {
    console.log("Mark as paid:", id);
    // Sau khi implement API, gọi refetch() để cập nhật dữ liệu
    // refetch();
  };

  if (!canView)
    return (
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
    );

  if (isError)
    return (
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
    );

  return (
    <>
      <div className="flex justify-start mb-3">
        <Input
          placeholder="Nhập từ khóa để tìm kế hoạch trả góp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 320 }}
        />
      </div>

      {installmentPlans.length > 0 ? (
        <InstallmentPlanTable
          data={installmentPlans}
          isLoading={isLoading}
          onMarkAsPaid={handleMarkAsPaid}
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
    </>
  );
};
