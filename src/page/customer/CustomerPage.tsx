import { useState, useMemo } from "react";
import { Button, Input, Select, Space } from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { ICustomer } from "../../model/Customer";
import {
  useCustomerList,
  useCustomerDelete,
} from "../../service/customerService";
import { CustomerTable } from "../../components/organisms/customer/CustomerTable";
import { CustomerDeleteConfirm } from "../../components/organisms/customer/CustomerDeleteConfirm";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useDebounce } from "../../hook/useDebounce";

const STATUS_OPTIONS = [
  { label: "LEAD", value: "LEAD" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
  { label: "BLOCKED", value: "BLOCKED" },
  { label: "DELETED", value: "DELETED" },
];

export const CustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.user);
  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[] | undefined>(undefined);
  const debouncedKeyword = useDebounce(keyword, 400);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
  const totalElements = useMemo(
    () => data?.result?.metadata?.totalElements ?? 0,
    [data]
  );

  const canCreate = role === "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";
  const canDelete = role === "DEALER_STAFF";

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

  const resetFilters = () => {
    setKeyword("");
    setStatus(undefined);
    setSortField("fullName");
    setSortDir("desc");
    setPage(0);
    setSize(10);
  };

  return (
    <CardWrapper>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#627254]">
          Danh sách khách hàng của đại lý
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className={`text-white ${
            canCreate
              ? "!bg-[#627254] !border-[#627254] hover:!bg-[#4f6f52]"
              : "!bg-gray-400 !border-gray-400 cursor-not-allowed"
          }`}
          disabled={!canCreate}
        >
          Thêm khách hàng
        </Button>
      </div>

      <div className="mb-4">
        <Space wrap size="middle">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, email hoặc SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 320 }}
          />
          <Select
            allowClear
            mode="multiple"
            style={{ width: 320 }}
            placeholder="Trạng thái (có thể chọn nhiều)"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(vals) => {
              setStatus(vals.length ? vals : undefined);
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
