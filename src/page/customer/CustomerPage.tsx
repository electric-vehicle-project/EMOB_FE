import { useState, useMemo } from "react";
import { Button, Select, Space } from "antd";
import { toast } from "react-toastify";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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

const STATUS_OPTIONS = [
  { label: "Tiềm năng", value: "LEAD" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Ngừng hoạt động", value: "INACTIVE" },
  { label: "Bị chặn", value: "BLOCKED" },
  { label: "Đã xoá", value: "DELETED" },
];

export const CustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);

  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";

  // ---- FILTERS & SORTING ----
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);

  const [status, setStatus] = useState<CustomerStatus[] | undefined>(undefined);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [sortField, setSortField] = useState("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ---- API HOOK ----
  const { data, isLoading, isFetching, refetch } = useCustomerList({
    page,
    size,
    keyword: debouncedKeyword,
    status,
    sortField,
    sortDir,
  });

  // ---- DATA MAPPING ----
  const customers: ICustomer[] = useMemo(
    () => data?.result?.data ?? [],
    [data]
  );

  const totalElements = useMemo(
    () => data?.result?.metadata?.totalElements ?? 0,
    [data]
  );

  // ---- PERMISSIONS ----
  const canCreate = role === "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";
  const canDelete = role === "DEALER_STAFF";

  // ---- MODAL DELETE ----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );

  const { mutateAsync: deleteCustomer, isPending } = useCustomerDelete();

  const handleCreate = () => {
    if (!canCreate) return;
    navigate(`/dealer_staff/customers/create`);
  };

  const handleEdit = (id: string) => {
    if (!canEdit) return;
    navigate(`/dealer_staff/customers/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    if (!canDelete) return;
    const target = customers.find((c) => c.id === id);
    if (!target) return;

    setSelectedCustomer(target);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteCustomer(selectedCustomer.id);
      toast.success("Đã xoá khách hàng thành công!");
      refetch();
    } catch {
      toast.error("Không thể xoá khách hàng này!");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <CardWrapper>
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khách hàng của đại lý
        </h2>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          disabled={!canCreate}
          className={`text-white ${
            canCreate
              ? "!bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52]"
              : "!bg-gray-400 !border-gray-400 cursor-not-allowed"
          }`}
        >
          Thêm khách hàng
        </Button>
      </div>

      {/* FILTER BAR */}
      <EMOBFilterBar
        keyword={keyword}
        onKeywordChange={(v) => setKeyword(v)}
        filterDropdown={
          <Space direction="vertical" style={{ width: "100%" }}>
            <div className="font-medium">Trạng thái</div>
            <Select
              mode="multiple"
              allowClear
              value={status}
              options={STATUS_OPTIONS}
              className="w-full"
              placeholder="Chọn trạng thái"
              onChange={(vals) => setStatus(vals.length ? vals : undefined)}
            />
          </Space>
        }
      />

      {/* CUSTOMER TABLE */}
      <CustomerTable
        data={customers}
        loading={isLoading || isFetching}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        sortField={sortField}
        sortDir={sortDir}
        onChangeSort={(field, order) => {
          setSortField(field || "fullName");
          setSortDir(order === "ascend" ? "asc" : "desc");
          setPage(0);
        }}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: totalElements,
          showSizeChanger: true,
          onChange: (p: number, s?: number) => {
            setPage(p - 1);
            setSize(s ?? 10);
          },
          position: ["bottomCenter"],
          showTotal: (t) => `Tổng cộng ${t} khách hàng`,
        }}
      />

      {/* DELETE MODAL */}
      <CustomerDeleteConfirm
        open={confirmOpen}
        customerName={selectedCustomer?.fullName}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isPending}
      />
    </CardWrapper>
  );
};

export default CustomerPage;
