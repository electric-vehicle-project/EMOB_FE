import { useState, useMemo } from "react";
import { Button, Select } from "antd";
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

  // ========================== FILTERS + SORT ==========================
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);

  const [status, setStatus] = useState<CustomerStatus[] | undefined>(undefined);

  const [sortField, setSortField] = useState("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // ========================== API ==========================
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

  // ========================== PERMISSIONS ==========================
  const isDealerStaff = role === "DEALER_STAFF";
  const canCreate = isDealerStaff;
  const canEdit = isDealerStaff;
  const canDelete = isDealerStaff;

  // ========================== DELETE ==========================
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );

  const { mutateAsync: deleteCustomer, isPending } = useCustomerDelete();

  const handleCreate = () => {
    navigate("/dealer_staff/customers/create");
  };

  const handleEdit = (id: string) => {
    navigate(`/dealer_staff/customers/edit/${id}`);
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
      toast.success("Đã xoá khách hàng thành công!");
      refetch();
    } catch {
      toast.error("Không thể xoá khách hàng!");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <CardWrapper>
      {/* ========================== HEADER ========================== */}
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

      {/* ========================== FILTER BAR ========================== */}
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
            {/* TRẠNG THÁI */}
            <div>
              <div className="font-medium mb-1">Trạng thái</div>
              <Select
                mode="multiple"
                allowClear
                value={status}
                className="w-full"
                placeholder="Chọn trạng thái"
                options={STATUS_OPTIONS}
                onChange={(vals) => setStatus(vals.length ? vals : undefined)}
              />
            </div>

            {/* SẮP XẾP THEO */}
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
                <Select.Option value="phoneNumber">Số điện thoại</Select.Option>
                <Select.Option value="dateOfBirth">Ngày sinh</Select.Option>
                <Select.Option value="memberShipLevel">Cấp độ</Select.Option>
              </Select>
            </div>

            {/* THỨ TỰ */}
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

      {/* ========================== TABLE ========================== */}
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
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s ?? 10);
          },
          position: ["bottomCenter"],
          showTotal: (t) => `Tổng cộng ${t} khách hàng`,
        }}
      />

      {/* ========================== DELETE MODAL ========================== */}
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
