import { useState, useMemo } from "react";
import { Result, Empty, Button } from "antd";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { SearchBar } from "../../molecules/SearchBar";
import { Button as EmobButton } from "../../atoms/Button";
import { AccountTable } from "../../molecules/Account/AccountTable";
import { AccountModal } from "./AccountModal";
import { AccountRoleSelectModal } from "../../molecules/Account/AccountRoleSelectModal";
import { DeleteConfirm } from "../DeleteConfirm";
import { useDebounce } from "../../../hook/useDebounce";
import {
  useGetAccountsByAdmin,
  useGetAccountsByManager,
  useChangeAccountStatus,
  useBanAccount,
} from "../../../service/accountService";
import { useDealersQuery } from "../../../service/dealerService";
import { Role, type IAccount } from "../../../model/Account";
import type { AccountCreatePayload } from "../../molecules/Account/AccountForm";
import { AccountDetailModal } from "../../molecules/Account/AccountDetailModal";
import api from "../../../config/api";

/* ===== Helper: xây URL đăng ký đúng theo baseURL từ api config, không hard-code host ===== */
const getApiBaseUrl = () => api.defaults.baseURL ?? "";

const getRegisterPathByRole = (creatorRole: Role) =>
  creatorRole === Role.MANAGER
    ? "/auth/register-by-manager"
    : "/auth/register-by-admin";

const registerAccount = async (
  creatorRole: Role,
  payload: AccountCreatePayload
) => {
  const baseUrl = getApiBaseUrl();
  const path = getRegisterPathByRole(creatorRole);
  const url = `${baseUrl}${path}`;

  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  let data: unknown;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text;
  }

  if (!response.ok) {
    interface ApiError extends Error {
      status: number;
      data: unknown;
    }
    const errorMessage =
      typeof data === "string"
        ? data || "Tạo tài khoản thất bại"
        : typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Tạo tài khoản thất bại";
    const err = new Error(errorMessage) as ApiError;
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

export const AccountList = () => {
  const user = useSelector((state: RootState) => state.user);
  const currentRole = user?.role as Role;

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [creatingRole, setCreatingRole] = useState<Role | null>(null);
  const [confirmBanId, setConfirmBanId] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{
    id: string;
    next: "ACTIVE" | "INACTIVE";
  } | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);

  const isAdmin = currentRole === Role.ADMIN;
  const isManager = currentRole === Role.MANAGER;

  // ====== Queries ======
  const adminQuery = useGetAccountsByAdmin(page, pageSize, {
    enabled: isAdmin,
    queryKey: ["accounts-by-admin", page, pageSize],
  });
  const managerQuery = useGetAccountsByManager(page, pageSize, {
    enabled: isManager,
    queryKey: ["accounts-by-manager", page, pageSize],
  });

  const { data: dealersData } = useDealersQuery({}, { size: 1000 });

  const dealerMap = useMemo(() => {
    const dealers = dealersData?.result?.data ?? [];
    const map: Record<string, string> = {};
    (dealers as { id: string; name: string }[]).forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [dealersData]);

  const dealerOptions = useMemo(() => {
    const list = dealersData?.result?.data ?? dealersData?.data ?? [];
    return (list as { id: string; name: string }[]).map((d) => ({
      label: d.name,
      value: d.id,
    }));
  }, [dealersData]);

  const changeStatus = useChangeAccountStatus();
  const banAccount = useBanAccount();

  const isLoading = isAdmin ? adminQuery.isLoading : managerQuery.isLoading;
  const refetch = isAdmin ? adminQuery.refetch : managerQuery.refetch;
  const accounts: IAccount[] = useMemo(
    () => (isAdmin ? adminQuery.data : managerQuery.data) ?? [],
    [isAdmin, adminQuery.data, managerQuery.data]
  );
  const meta = (isAdmin ? adminQuery.meta : managerQuery.meta) ?? null;

  const filteredAccounts: IAccount[] = useMemo(() => {
    const keyword = debounced.trim().toLowerCase();
    if (!keyword) return accounts;
    return accounts.filter(
      (acc) =>
        acc.fullName?.toLowerCase().includes(keyword) ||
        acc.email?.toLowerCase().includes(keyword) ||
        acc.phone?.includes(keyword)
    );
  }, [accounts, debounced]);

  if (!isAdmin && !isManager) {
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
  }

  /* ======================== CREATE ACCOUNT ======================== */
  const handleCreate = async (values: AccountCreatePayload) => {
    await registerAccount(currentRole, values);
    toast.success("✅ Tạo tài khoản thành công!");
    setAccountModalOpen(false);
    setCreatingRole(null);
    await refetch();
  };

  /* ======================== STATUS & BAN ======================== */
  const doChangeStatus = async (id: string, next: "ACTIVE" | "INACTIVE") => {
    await changeStatus.mutateAsync({ id, data: { status: next } });
    toast.success(
      next === "ACTIVE" ? "Đã mở lại tài khoản" : "Đã tạm ngưng tài khoản"
    );
    await refetch();
  };

  const doBan = async (id: string) => {
    await banAccount.mutateAsync(id);
    toast.success("Đã cấm vĩnh viễn tài khoản!");
    await refetch();
  };

  const paginationConfig = {
    current: (meta?.page ?? 0) + 1,
    pageSize: meta?.size ?? pageSize,
    total: meta?.totalElements ?? 0,
    showSizeChanger: true,
    onChange: (current: number, size?: number) => {
      setPage(current - 1);
      if (size && size !== pageSize) setPageSize(size);
    },
    showTotal: (total: number) => `Tổng cộng ${total} tài khoản`,
  };

  const handleViewDetails = (account: IAccount) => {
    setSelectedAccount(account);
    setDetailModalOpen(true);
  };

  const selectedDealerName =
    selectedAccount?.dealerId && dealerMap[selectedAccount.dealerId]
      ? dealerMap[selectedAccount.dealerId]
      : undefined;

  return (
    <div className="space-y-4">
      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm tài khoản..."
          className="w-full sm:max-w-[420px]"
        />

        {isAdmin ? (
          <EmobButton
            type="primary"
            onClick={() => setRoleModalOpen(true)}
            className="!bg-[#627254] hover:!bg-[#525e46] text-white px-6 py-2 rounded-xl"
          >
            Thêm tài khoản mới
          </EmobButton>
        ) : (
          <EmobButton
            type="primary"
            onClick={() => {
              setCreatingRole(Role.DEALER_STAFF);
              setAccountModalOpen(true);
            }}
            className="!bg-[#627254] hover:!bg-[#525e46] text-white px-6 py-2 rounded-xl"
          >
            Thêm nhân viên đại lý
          </EmobButton>
        )}
      </div>

      {/* Table (đồng bộ UI với DealerTable, không scroll ngang/dọc) */}
      {filteredAccounts.length > 0 ? (
        <AccountTable
          data={filteredAccounts}
          loading={isLoading}
          canModify
          pagination={paginationConfig}
          dealerMap={dealerMap}
          currentUserRole={currentRole}
          onChangeStatus={(id, next) => setConfirmStatus({ id, next })}
          onBan={(id) => setConfirmBanId(id)}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Empty
            description="Không tìm thấy tài khoản nào"
            className="py-10 text-gray-500"
          />
        </div>
      )}

      {/* Role select (Admin) */}
      {isAdmin && (
        <AccountRoleSelectModal
          open={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          currentUserRole={currentRole}
          onSelect={(role) => {
            setCreatingRole(role);
            setAccountModalOpen(true);
          }}
        />
      )}

      {/* Create modal */}
      <AccountModal
        open={accountModalOpen}
        onClose={() => {
          setAccountModalOpen(false);
          setCreatingRole(null);
        }}
        creatorRole={currentRole}
        creatingRole={creatingRole}
        onSubmit={handleCreate}
        loading={false}
        dealerOptions={creatingRole === Role.MANAGER ? dealerOptions : []}
      />

      {/* Confirm đổi trạng thái */}
      <DeleteConfirm
        open={!!confirmStatus}
        onConfirm={async () => {
          if (confirmStatus)
            await doChangeStatus(confirmStatus.id, confirmStatus.next);
          setConfirmStatus(null);
        }}
        onCancel={() => setConfirmStatus(null)}
        okText={confirmStatus?.next === "INACTIVE" ? "Tạm ngưng" : "Mở lại"}
        danger={false}
        message={
          confirmStatus?.next === "INACTIVE"
            ? "Bạn có chắc chắn muốn tạm ngưng tài khoản này?"
            : "Bạn có chắc chắn muốn mở lại tài khoản này?"
        }
      />

      {/* Confirm cấm vĩnh viễn */}
      <DeleteConfirm
        open={!!confirmBanId}
        onConfirm={async () => {
          if (confirmBanId) await doBan(confirmBanId);
          setConfirmBanId(null);
        }}
        onCancel={() => setConfirmBanId(null)}
        okText="Cấm vĩnh viễn"
        danger
        message="Bạn có chắc chắn muốn cấm vĩnh viễn tài khoản này?"
      />

      {/* Detail modal */}
      <AccountDetailModal
        open={detailModalOpen}
        account={selectedAccount}
        dealerName={selectedDealerName}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
};
