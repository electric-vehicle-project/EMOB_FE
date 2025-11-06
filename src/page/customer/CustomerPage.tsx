import { useState, useMemo } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";
import type { ICustomer } from "../../model/Customer";

import {
  useCustomerList,
  useCustomerDelete,
} from "../../service/customerService";

import { CustomerTable } from "../../components/organisms/customer/CustomerTable";
import { CustomerFilterBar } from "../../components/molecules/customer/CustomerFilterBar";
import { CustomerDeleteConfirm } from "../../components/organisms/customer/CustomerDeleteConfirm";
import { CardWrapper } from "../../components/template/CardWrapper";
import { useDebounce } from "../../hook/useDebounce";

export const CustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  // ========================
  // STATE
  // ========================
  const [keyword, setKeyword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );

  const debouncedKeyword = useDebounce(keyword, 400);

  // ========================
  // DATA
  // ========================
  const { data, isLoading, isFetching, refetch } = useCustomerList({
    page: 0,
    size: 50,
  });

  const customers: ICustomer[] = data?.result?.data ?? [];

  // ========================
  // ROLE-BASED PERMISSION
  // ========================
  const role = (user as any)?.role as "MANAGER" | "DEALER_STAFF";

  const canCreate = role === "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";
  const canDelete = role === "DEALER_STAFF";

  // ========================
  // LOCAL SEARCH FILTER
  // ========================
  const filteredCustomers = useMemo(() => {
    if (!debouncedKeyword) return customers;
    const query = debouncedKeyword.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phoneNumber.toLowerCase().includes(query)
    );
  }, [debouncedKeyword, customers]);

  // ========================
  // HANDLERS
  // ========================
  const handleCreate = () => {
    if (!canCreate) return;
    navigate(`/dealer_staff/customers/create`);
  };

  const handleEdit = (id: string) => {
    if (!canEdit) return;
    navigate(`/dealer_staff/customers/edit/${id}`);
  };

  const { mutateAsync: deleteCustomer, isPending } = useCustomerDelete();

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
      message.success("Đã xoá khách hàng thành công!");
      refetch();
    } catch {
      message.error("Không thể xoá khách hàng này!");
    } finally {
      setConfirmOpen(false);
    }
  };

  // ========================
  // RENDER
  // ========================
  return (
    <CardWrapper>
      {/* Header */}
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

      {/* Search bar */}
      <CustomerFilterBar keyword={keyword} onKeywordChange={setKeyword} />

      {/* Table */}
      <CustomerTable
        data={filteredCustomers}
        loading={isLoading || isFetching}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete confirm */}
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
