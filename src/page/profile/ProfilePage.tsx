// src/page/profile/ProfilePage.tsx
import React, { useMemo, useState } from "react";
import { Card, Tag, Skeleton, Space, Result } from "antd";
import { useDispatch } from "react-redux";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { CardWrapper } from "../../components/template/CardWrapper";
import type { IAccount, Role, AccountStatus } from "../../model/Account";
import EditProfileModal from "../../components/organisms/profile/EditProfileModal";
import ChangePasswordModal from "../../components/organisms/profile/ChangePasswordModal";
import ProfileDetailsByRole from "../../components/organisms/profile/ProfileDetailsByRole";
import { useDealerByIdQuery } from "../../service/dealerService";
import { login as loginAction } from "../../redux/features/userSlice";
import { Button } from "../../components/atoms/Button"; // ⬅️ dùng atoms/Button

/* ======= Maps ======= */
const mapStatusLabel: Record<AccountStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  BANNED: "Đã khóa",
};

const mapStatusColor: Record<AccountStatus, string> = {
  ACTIVE: "green",
  INACTIVE: "gold",
  BANNED: "red",
};

const mapRoleLabel: Record<Role, string> = {
  ADMIN: "Quản trị (Hãng xe)",
  MANAGER: "Quản lý đại lý",
  DEALER_STAFF: "Nhân viên đại lý",
  EVM_STAFF: "Nhân viên EVM",
};

/* ======= Helpers ======= */
const initialsOf = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Card className="rounded-2xl shadow-sm border border-gray-100" title={title}>
    {children}
  </Card>
);

/* ================================
  👤 Trang Hồ sơ cá nhân (Redux only)
================================= */
export default function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useCurrentUser();
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  // ✅ Chỉ ADMIN / EVM_STAFF mới được gọi dealerById để lấy tên
  const canQueryDealerName =
    (profile?.role === "ADMIN" || profile?.role === "EVM_STAFF") &&
    !!profile?.dealerId;

  const dealerQuery = useDealerByIdQuery(profile?.dealerId as string, {
    enabled: canQueryDealerName,
  });

  const dealerName: string | undefined = useMemo(() => {
    const d = dealerQuery.data?.result ?? dealerQuery.data;
    return d?.name || undefined;
  }, [dealerQuery.data]);

  const header = useMemo(
    () => ({
      fullName: profile?.fullName ?? "",
      email: profile?.email ?? "",
      status: profile?.status,
      role: profile?.role,
    }),
    [profile]
  );

  const isLoadingDealer = dealerQuery.isFetching && canQueryDealerName;

  const content = (() => {
    if (!profile) {
      return (
        <Result
          status="403"
          title="Không có dữ liệu hồ sơ"
          subTitle="Vui lòng đăng nhập lại để xem thông tin cá nhân."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-12">
        <Section title="Thông tin tổng quan">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                {initialsOf(header.fullName)}
              </div>
              <div>
                <div className="text-xl font-bold text-[#2e3825]">
                  {header.fullName}
                </div>
                <div className="text-gray-600 break-words">{header.email}</div>
              </div>
            </div>
            <Space>
              {header.status && (
                <Tag color={mapStatusColor[header.status]}>
                  {mapStatusLabel[header.status]}
                </Tag>
              )}
              {header.role && <Tag>{mapRoleLabel[header.role]}</Tag>}
            </Space>
          </div>

          {/* Detail */}
          <div className="mt-4">
            {isLoadingDealer ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <ProfileDetailsByRole
                profile={profile as IAccount}
                dealerName={dealerName}
              />
            )}
          </div>

          {/* Actions (đã đồng bộ atoms/Button) */}
          <div className="mt-4 flex gap-2 justify-end">
            <Button type="primary" onClick={() => setEditOpen(true)}>
              Chỉnh sửa thông tin
            </Button>
            <Button type="default" onClick={() => setPwdOpen(true)}>
              Đổi mật khẩu
            </Button>
          </div>
        </Section>
      </div>
    );
  })();

  return (
    <CardWrapper
      title="Hồ sơ cá nhân"
      subtitle="Thông tin tài khoản & bảo mật"
      maxWidth="max-w-5xl"
      variant="profile"
    >
      {content}

      {profile && (
        <>
          <EditProfileModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            profile={profile as IAccount}
            onSuccess={(updated) => {
              if (updated) dispatch(loginAction(updated));
              setEditOpen(false);
            }}
          />
          <ChangePasswordModal
            open={pwdOpen}
            onClose={() => setPwdOpen(false)}
            onSuccess={() => setPwdOpen(false)}
          />
        </>
      )}
    </CardWrapper>
  );
}
