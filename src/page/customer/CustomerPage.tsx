// src/pages/customer/CustomerPage.tsx
import { useState, useMemo } from "react";
import { Button, Select } from "antd";
import { toast } from "react-toastify";
import { PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";
import type { ICustomer, CustomerStatus } from "../../model/Customer";

import {
  useCustomerList,
  useCustomerDelete,
} from "../../service/customerService";

import { CustomerTable } from "../../components/organisms/customer/CustomerTable";
import { CustomerDeleteConfirm } from "../../components/organisms/customer/CustomerDeleteConfirm";
import { CardWrapper } from "../../components/template/CardWrapper";
import { EMOBFilterBar } from "../../components/molecules/EMOBFilterBar";
import { useDebounce } from "../../hook/useDebounce";

import { CustomerCreateModal } from "../../components/organisms/customer/CustomerCreateModal";
import { CustomerEditModal } from "../../components/organisms/customer/CustomerEditModal";
import { CustomerDetailModal } from "../../components/organisms/customer/CustomerDetailModal";

const STATUS_OPTIONS = [
  { label: "Tiềm năng", value: "LEAD" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Ngừng hoạt động", value: "INACTIVE" },
  { label: "Bị chặn", value: "BLOCKED" },
  { label: "Đã xoá", value: "DELETED" },
];

export const CustomerPage: React.FC = () => {
  const user = useSelector((s: RootState) => s.user);
  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";

  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);

  const [status, setStatus] = useState<CustomerStatus[] | undefined>(undefined);

  const [sortField, setSortField] = useState("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data, isLoading, isFetching, refetch } = useCustomerList({
    page,
    size,
    keyword: debouncedKeyword,
    status,
    sortField,
    sortDir,
  });

  const customers: ICustomer[] = useMemo(
    () => data?.result?.data ?? [],
    [data]
  );

  const totalElements = data?.result?.metadata?.totalElements ?? 0;

  const isDealerStaff = role === "DEALER_STAFF";
  const canCreate = isDealerStaff;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );

  const { mutateAsync: deleteCustomer, isPending } = useCustomerDelete();

  const handleCreate = () => {
    setCreateOpen(true);
  };

  const handleEdit = (id: string) => {
    const target = customers.find((c) => c.id === id) || null;
    setSelectedCustomer(target);
    setEditOpen(true);
  };

  const handleDetail = (id: string) => {
    const target = customers.find((c) => c.id === id) || null;
    setSelectedCustomer(target);
    setDetailOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const target = customers.find((c) => c.id === id);
    if (!target) return;

    setSelectedCustomer(target);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomer(selectedCustomer.id);
      toast.success("Đã xoá khách hàng thành công");
      refetch();
    } catch {
      toast.error("Không thể xoá khách hàng");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <CustomerCreateModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          refetch();
        }}
      />

      <CustomerEditModal
        open={editOpen}
        customerId={selectedCustomer?.id}
        onClose={() => {
          setEditOpen(false);
          refetch();
        }}
      />

      <CustomerDetailModal
        open={detailOpen}
        customerId={selectedCustomer?.id}
        onClose={() => setDetailOpen(false)}
      />

      <CardWrapper
        title="Quản lý khách hàng"
        subtitle="Theo dõi và quản lý thông tin khách hàng của đại lý"
        variant="dashboard"
      >
        <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
          <EMOBFilterBar
            keyword={keyword}
            onKeywordChange={(v) => setKeyword(v)}
            onReset={() => {
              setKeyword("");
              setStatus(undefined);
              setSortField("fullName");
              setSortDir("desc");
              setPage(0);
              setSize(10);
            }}
            filterDropdown={
              <div className="flex flex-col gap-4 w-full">
                <div>
                  <div className="font-medium mb-1">Trạng thái</div>
                  <Select
                    mode="multiple"
                    allowClear
                    value={status}
                    className="w-full"
                    placeholder="Chọn trạng thái"
                    options={STATUS_OPTIONS}
                    onChange={(vals) =>
                      setStatus(vals.length ? vals : undefined)
                    }
                  />
                </div>

                <div>
                  <div className="font-medium mb-1">Sắp xếp theo</div>
                  <Select
                    className="w-full"
                    value={sortField}
                    onChange={(v) => {
                      setSortField(v);
                      setPage(0);
                    }}
                  >
                    <Select.Option value="fullName">Họ và tên</Select.Option>
                    <Select.Option value="email">Email</Select.Option>
                    <Select.Option value="phoneNumber">
                      Số điện thoại
                    </Select.Option>
                    <Select.Option value="dateOfBirth">Ngày sinh</Select.Option>
                    <Select.Option value="memberShipLevel">
                      Cấp độ
                    </Select.Option>
                  </Select>
                </div>

                <div>
                  <div className="font-medium mb-1">Thứ tự</div>
                  <Select
                    className="w-full"
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
            }
          />

          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              disabled={!canCreate}
              className="text-white !bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52]"
            >
              Thêm khách hàng
            </Button>
          )}
        </div>

        <CustomerTable
          data={customers}
          loading={isLoading || isFetching}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onDetail={handleDetail}
          sortField={sortField}
          sortDir={sortDir}
          onChangeSort={() => undefined}
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
            showTotal: (t) => `Tổng cộng ${t} khách hàng`,
          }}
        />

        <CustomerDeleteConfirm
          open={confirmOpen}
          customerName={selectedCustomer?.fullName}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          loading={isPending}
        />
      </CardWrapper>
    </>
  );
};

export default CustomerPage;
