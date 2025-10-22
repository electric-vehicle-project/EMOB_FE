import { useState } from "react";
import { Spin } from "antd";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

import { useDebounce } from "../../hook/useDebounce";
import { SearchBar } from "../molecules/SearchBar";
import { Button } from "../atoms/Button";
import { AccountTable } from "../molecules/Account/AccountTable";
import { AccountModal } from "./AccountModal";

import {
  useGetAccountsByAdmin,
  useGetAccountsByManager,
  useRegisterByAdmin,
  useRegisterByManager,
} from "../../service/accountService";

import { Role } from "../../model/Account";
import type { IAccount } from "../../model/Account";
import type { AccountCreatePayload } from "../molecules/Account/AccountForm";

export const AccountList = () => {
  // ===== Lấy thông tin người dùng hiện tại =====
  const user = useSelector((state: RootState) => state.user);
  const role: Role = (user?.role as Role) ?? Role.ADMIN;

  // ===== State UI =====
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);

  // ===== API HOOKS =====
  const adminQuery = useGetAccountsByAdmin();
  const managerQuery = useGetAccountsByManager();
  const {
    data: accounts = [],
    refetch,
    isLoading,
  } = role === Role.ADMIN ? adminQuery : managerQuery;

  const registerByAdmin = useRegisterByAdmin();
  const registerByManager = useRegisterByManager();
  const createAccount =
    role === Role.ADMIN ? registerByAdmin : registerByManager;

  // ===== Lọc tìm kiếm (client-side) =====
  const filtered = accounts.filter((acc: IAccount) =>
    acc.fullName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // ✅ Tạo tài khoản mới
  const handleCreate = async (values: AccountCreatePayload) => {
    try {
      await createAccount.mutateAsync(values);
      toast.success("Tạo tài khoản mới thành công!");
      setModalOpen(false);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Không thể tạo tài khoản!");
    }
  };

  return (
    <Spin
      spinning={isLoading || createAccount.isPending}
      tip="Đang xử lý..."
      size="large"
    >
      <div className="space-y-4">
        {/* Thanh tìm kiếm + nút thêm */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm tài khoản..."
            className="w-full sm:max-w-[420px] hover-lift"
          />

          <Button
            type="primary"
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto sm:ml-4 px-6 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Thêm tài khoản mới
          </Button>
        </div>

        {/* Bảng danh sách tài khoản */}
        <AccountTable data={filtered} loading={isLoading} />

        {/* Modal tạo tài khoản */}
        <AccountModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
          loading={createAccount.isPending}
          role={role}
        />
      </div>
    </Spin>
  );
};
