/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { Result, Empty, Button, Dropdown, Select, Space } from "antd";
import { PlusOutlined, SlidersOutlined } from "@ant-design/icons";
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
import { Card } from "../../atoms/Card";

/* ======================= Helper ======================= */
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
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "string"
        ? data || "Tạo tài khoản thất bại"
        : typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Tạo tài khoản thất bại";

    const err = new Error(errorMessage);
    throw err;
  }

  return data;
};

/* ======================= MAIN COMPONENT ======================= */
export const AccountList = () => {
  const user = useSelector((state: RootState) => state.user);
  const currentRole = user?.role as Role;

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [filterRole, setFilterRole] = useState<string | undefined>();

  /* MULTI FILTER STATUS */
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

  const [filterOpen, setFilterOpen] = useState(false);

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

  const adminQuery = useGetAccountsByAdmin(page, pageSize, {
    enabled: isAdmin,
    queryKey: ["accounts-by-admin", page, pageSize, sortField, sortDir],
    sortField,
    sortDir,
  });

  const managerQuery = useGetAccountsByManager(page, pageSize, {
    enabled: isManager,
    queryKey: ["accounts-by-manager", page, pageSize, sortField, sortDir],
    sortField,
    sortDir,
  });

  const { data: dealersData } = useDealersQuery(0, 1000);

  const dealerMap = useMemo(() => {
    const dealers = dealersData?.result?.data ?? [];
    const map: Record<string, string> = {};
    (dealers as { id: string; name: string }[]).forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [dealersData]);

  const dealerOptions = useMemo(() => {
    const dealers = dealersData?.result?.data ?? [];
    return (dealers as { id: string; name: string }[]).map((d) => ({
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

  /* ======================= SEARCH + FILTER ======================= */
  const filteredAccounts: IAccount[] = useMemo(() => {
    let list = accounts;

    const keyword = debounced.trim().toLowerCase();
    if (keyword) {
      list = list.filter(
        (acc) =>
          acc.fullName?.toLowerCase().includes(keyword) ||
          acc.email?.toLowerCase().includes(keyword) ||
          acc.phone?.includes(keyword)
      );
    }

    if (isAdmin && filterRole) {
      list = list.filter((acc) => acc.role === filterRole);
    }

    /* MULTI STATUS FILTER */
    if (filterStatus.length > 0) {
      list = list.filter((acc) => filterStatus.includes(acc.status));
    }

    return list;
  }, [accounts, debounced, filterRole, filterStatus, isAdmin]);

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

  const handleCreate = async (values: AccountCreatePayload) => {
    await registerAccount(currentRole, values);
    toast.success("Tạo tài khoản thành công!");
    setAccountModalOpen(false);
    setCreatingRole(null);
    await refetch();
  };

  const doChangeStatus = async (id: string, next: "ACTIVE" | "INACTIVE") => {
    await changeStatus.mutateAsync({ id, data: { status: next } });
    toast.success(next === "ACTIVE" ? "Đã mở lại tài khoản" : "Đã tạm ngưng");
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

  /* ======================= FILTER PANEL ======================= */
  const FilterContent = () => (
    <div
      {...({ onClick: (e: any) => e.stopPropagation() } as any)}
      className="p-4 bg-white rounded-xl shadow-lg w-[260px] flex flex-col gap-4"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {isAdmin && (
          <div>
            <b className="text-gray-700">Vai trò</b>
            <Select
              allowClear
              className="w-full mt-2"
              value={filterRole}
              onChange={(v) => {
                setFilterRole(v);
                setPage(0);
              }}
            >
              <Select.Option value="MANAGER">Quản lý đại lý</Select.Option>
              <Select.Option value="EVM_STAFF">Nhân viên EVM</Select.Option>
            </Select>
          </div>
        )}

        <div>
          <b className="text-gray-700">Trạng thái</b>
          <Select
            mode="multiple"
            allowClear
            className="w-full mt-2"
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v);
              setPage(0);
            }}
          >
            <Select.Option value="ACTIVE">Hoạt động</Select.Option>
            <Select.Option value="INACTIVE">Ngừng hoạt động</Select.Option>
            <Select.Option value="BANNED">Đã cấm</Select.Option>
          </Select>
        </div>

        <div>
          <b className="text-gray-700">Sắp xếp theo</b>
          <Select
            className="w-full mt-2"
            value={sortField}
            onChange={(v) => {
              setSortField(v);
              setPage(0);
            }}
          >
            <Select.Option value="createdAt">Ngày tạo</Select.Option>
            <Select.Option value="fullName">Tên người dùng</Select.Option>
            <Select.Option value="email">Email</Select.Option>
          </Select>
        </div>

        <div>
          <b className="text-gray-700">Thứ tự</b>
          <Select
            className="w-full mt-2"
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
      </Space>
    </div>
  );

  /* ======================= UI ======================= */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm tài khoản..."
            className="w-full sm:max-w-[420px]"
          />

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

        {isAdmin ? (
          <EmobButton
            type="primary"
            icon={<PlusOutlined />}
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
