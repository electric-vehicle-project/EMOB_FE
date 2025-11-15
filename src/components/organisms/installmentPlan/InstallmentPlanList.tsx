import { useState, useMemo, useEffect } from "react";
import { Result, Button, Empty, Select, Space, Dropdown } from "antd";
import type { IInstallmentPlan } from "../../../model/InstallmentPlan";
import { SearchBar } from "../../molecules/SearchBar";
import { useDebounce } from "../../../hook/useDebounce";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import {
  useCurrentDealerInstallmentPlansQuery,
  useInstallmentPlansQuery,
} from "../../../service/installmentPlanService";
import { InstallmentPlanTable } from "../../molecules/installmentPlan/InstallmentPlanTable";
import type { InstallmentPlanApiModel } from "../../../model/InstallmentPlan";
import { Card } from "../../atoms/Card";
import { SlidersOutlined } from "@ant-design/icons";

export const InstallmentPlanList = () => {
  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState("downDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(false);

  const user = useCurrentUser();
  const role = (user as { role?: string } | null)?.role || "";

  const canView =
    role === "ADMIN" ||
    role === "EVM_STAFF" ||
    role === "DEALER_STAFF" ||
    role === "MANAGER";

  const isDealerRole = role === "DEALER_STAFF" || role === "MANAGER";
  const isAdminRole = role === "ADMIN" || role === "EVM_STAFF";

  // reset page khi search
  useEffect(() => {
    setCurrent(1);
  }, [debouncedSearch]);

  // param
  const params = useMemo(
    () => ({
      page: current - 1,
      size: pageSize,
      keyword: debouncedSearch || undefined,
      sortField,
      sortDir,
      statuses: statusFilter,
    }),
    [current, pageSize, debouncedSearch, sortField, sortDir, statusFilter]
  );

  // query
  const allPlansQuery = useInstallmentPlansQuery(
    { enabled: canView && isAdminRole },
    params
  );

  const dealerPlansQuery = useCurrentDealerInstallmentPlansQuery(
    { enabled: canView && isDealerRole },
    params
  );

  const { data, refetch, isLoading, isError, error } = isDealerRole
    ? dealerPlansQuery
    : allPlansQuery;

  // api response thành modal
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
  };

  // =============== FILTER DROPDOWN PANEL ===============
  const FilterContent = () => (
    <Card
      {...({ onClick: (e: any) => e.stopPropagation() } as any)}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* STATUS FILTER */}
        <div>
          <b className="text-gray-700">Trạng thái</b>
          <Select
            mode="multiple"
            allowClear
            className="w-full mt-2"
            value={statusFilter}
            onChange={(values) => {
              setStatusFilter(values);
              setCurrent(1);
            }}
            placeholder="Chọn trạng thái"
          >
            <Select.Option value="PAID">Đã thanh toán hết</Select.Option>
            <Select.Option value="NOT_PAID">Chưa thanh toán</Select.Option>
            <Select.Option value="OVERDUE">Trễ hẹn</Select.Option>
            <Select.Option value="CANCELLED">Hủy thanh toán</Select.Option>
          </Select>
        </div>

        {/* SORT FIELD */}
        <div>
          <b className="text-gray-700">Sắp xếp theo</b>
          <Select
            className="w-full mt-2"
            value={sortField}
            onChange={(v) => {
              setSortField(v);
              setCurrent(1);
            }}
          >
            <Select.Option value="downDate">Ngày đặt cọc</Select.Option>
            <Select.Option value="nextDueDate">
              Ngày thanh toán tiếp theo
            </Select.Option>
            <Select.Option value="totalAmount">Tổng tiền</Select.Option>
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
              setCurrent(1);
            }}
          >
            <Select.Option value="asc">Tăng dần</Select.Option>
            <Select.Option value="desc">Giảm dần</Select.Option>
          </Select>
        </div>
      </Space>
    </Card>
  );

  // ============ UI RENDER ============

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
        subTitle={error?.message || "Vui lòng thử lại."}
        extra={
          <Button type="primary" onClick={() => refetch()}>
            Thử lại
          </Button>
        }
      />
    );

  return (
    <>
      <div className="flex justify-between items-center mb-3 gap-3">
        <div className="w-full max-w-xs sm:max-w-sm">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm kế hoạch trả góp..."
          />
        </div>

        {/* FILTER DROPDOWN */}
        <Dropdown
          trigger={["click"]}
          open={filterOpen}
          onOpenChange={setFilterOpen}
          dropdownRender={() => <FilterContent />}
        >
          <Button
            type="text"
            icon={<SlidersOutlined style={{ fontSize: 20 }} />}
            className="text-gray-600 hover:text-black"
          />
        </Dropdown>
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
