/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button, Empty, Select, Space, Dropdown } from "antd";
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
import { SlidersOutlined } from "@ant-design/icons";
import { Card } from "../../components/atoms/Card";
import { SearchBar } from "../../components/molecules/SearchBar";
import { Link } from "react-router-dom";
import { ROUTES } from "../../model/routePaths";

export const InstallmentPlanCustomersPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState("downDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
      sortField,
      sortDir,
      statuses: statusFilter,
    }),
    [current, pageSize, debouncedSearch, sortField, sortDir, statusFilter]
  );

  const customerPlansQuery = useInstallmetnPlanByCustomersQuery(
    { enabled: canView },
    params
  );

  const { data, isLoading } = customerPlansQuery;

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

  const handleViewDetail = useCallback((id: string) => {
    setSelectedId(id);
    setIsModalOpen(true);
  }, []);

  // ================== FILTER CONTENT ==================
  const FilterContent = () => (
    <Card
      {...({ onClick: (e: any) => e.stopPropagation() } as any)}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      <Space direction="vertical" className="w-full">
        <div>
          <b>Trạng thái</b>
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
          <b>Sắp xếp theo</b>
          <Select
            className="w-full mt-2"
            value={sortField}
            onChange={(v) => {
              setSortField(v);
              setCurrent(1);
            }}
          >
            <Select.Option value="effectiveDate">Ngày hiệu lực</Select.Option>
            <Select.Option value="downDate">Ngày đặt cọc</Select.Option>
            <Select.Option value="nextDueDate">
              Ngày thanh toán tiếp theo
            </Select.Option>
          </Select>
        </div>

        <div>
          <b>Thứ tự</b>
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

  // ================== UI ==================
  return (
    <CardWrapper
      title="Quản lý kế hoạch trả góp khách hàng"
      subtitle="Theo dõi, tìm kiếm và xem chi tiết kế hoạch trả góp của khách hàng"
      variant="dashboard"
      rightLink={
        <Link
          to={`/${role.toLowerCase()}/${ROUTES.INSTALLMENT_PLAN}`}
          className="text-green-600 underline hover:text-green-800 text-sm"
        >
          Xem tất cả kế hoạch trả góp
        </Link>
      }
    >
      {/* SEARCH + FILTER */}
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
