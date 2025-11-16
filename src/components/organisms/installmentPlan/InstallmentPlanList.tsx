/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { Result, Button, Empty, Select, Space, Dropdown } from "antd";
import type {
  IInstallmentPlan,
  InstallmentPlanApiModel,
} from "../../../model/InstallmentPlan";
import { SearchBar } from "../../molecules/SearchBar";
import { useDebounce } from "../../../hook/useDebounce";
import { useCurrentUser } from "../../../utils/getCurrentUser";
import {
  useCurrentDealerInstallmentPlansQuery,
  useInstallmentPlansQuery,
} from "../../../service/installmentPlanService";
import { InstallmentPlanTable } from "../../molecules/installmentPlan/InstallmentPlanTable";
import { Card } from "../../atoms/Card";
import { SlidersOutlined } from "@ant-design/icons";

export const InstallmentPlanList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const isDealer = role === "DEALER_STAFF" || role === "MANAGER";

  useEffect(() => setCurrent(1), [debouncedSearch]);

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

  const allPlansQuery = useInstallmentPlansQuery(
    { enabled: canView && !isDealer },
    params
  );

  const dealerPlansQuery = useCurrentDealerInstallmentPlansQuery(
    { enabled: canView && isDealer },
    params
  );

  const { data, refetch, isLoading, isError, error } = isDealer
    ? dealerPlansQuery
    : allPlansQuery;

  const installmentPlans: IInstallmentPlan[] = useMemo(() => {
    const raw: InstallmentPlanApiModel[] = data?.result?.data ?? [];
    return raw.map((p) => ({
      id: p.id,
      downDate: p.downDate,
      deposit: p.deposit,
      totalAmount: p.totalAmount,
      monthlyAmount: p.monthlyAmount,
      interestRate: p.interestRate,
      termMonths: p.termMonths,
      nextDueDate: p.nextDueDate,
      status: p.status,
    }));
  }, [data]);

  const total = data?.result?.metadata?.totalElements ?? 0;

  const FilterContent = () => (
    <Card
      {...({ onClick: (e: any) => e.stopPropagation() } as any)}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px]"
    >
      <Space direction="vertical" className="w-full">
        <div>
          <b className="text-gray-700">Trạng thái</b>
          <Select
            mode="multiple"
            allowClear
            className="w-full mt-2"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setCurrent(1);
            }}
          >
            <Select.Option value="PAID">Đã thanh toán hết</Select.Option>
            <Select.Option value="NOT_PAID">Chưa thanh toán</Select.Option>
            <Select.Option value="OVERDUE">Trễ hẹn</Select.Option>
            <Select.Option value="CANCELLED">Hủy thanh toán</Select.Option>
          </Select>
        </div>

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

  if (!canView)
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập."
      />
    );

  if (isError)
    return (
      <Result
        status="error"
        title="Không thể tải danh sách"
        subTitle={error?.message}
        extra={<Button onClick={() => refetch()}>Thử lại</Button>}
      />
    );

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-[320px]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm kế hoạch trả góp..."
          />
        </div>

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
          onMarkAsPaid={() => {}}
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
