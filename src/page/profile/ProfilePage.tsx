// src/page/profile/ProfilePage.tsx
import React, { useMemo, useState } from "react";
import { Card, Tag, Skeleton, Result } from "antd";
import { useDispatch } from "react-redux";
import { useCurrentUser } from "../../utils/getCurrentUser";
import { CardWrapper } from "../../components/template/CardWrapper";
import type { IAccount, Role, AccountStatus } from "../../model/Account";
import EditProfileModal from "../../components/organisms/profile/EditProfileModal";
import ChangePasswordModal from "../../components/organisms/profile/ChangePasswordModal";
import ProfileDetailsByRole from "../../components/organisms/profile/ProfileDetailsByRole";
import { useDealerByIdQuery } from "../../service/dealerService";
import { login as loginAction } from "../../redux/features/userSlice";
import { Button } from "../../components/atoms/Button";

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

const initialsOf = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const Section: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Card className="rounded-2xl shadow-sm border border-gray-100" title={title}>
    {children}
  </Card>
);

export default function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useCurrentUser();
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

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
      <div className="grid gap-6">
        {/* Header */}
        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700 text-xl">
                {initialsOf(header.fullName)}
              </div>
              <div className="min-w-0">
                <div className="text-xl md:text-2xl font-bold text-[#111827]">
                  {header.fullName}
                </div>
                <div className="text-sm text-gray-600 break-words">
                  {header.email}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {header.role && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {mapRoleLabel[header.role]}
                    </span>
                  )}
                  {header.status && (
                    <Tag color={mapStatusColor[header.status]}>
                      {mapStatusLabel[header.status]}
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="default" onClick={() => setPwdOpen(true)}>
                Đổi mật khẩu
              </Button>
              <Button type="primary" onClick={() => setEditOpen(true)}>
                Chỉnh sửa thông tin
              </Button>
            </div>
          </div>
        </Card>

        {/* Thông tin cá nhân */}
        <Section title="Thông tin cá nhân">
          {isLoadingDealer ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <ProfileDetailsByRole
              profile={profile as IAccount}
              dealerName={dealerName}
            />
          )}
        </Section>

        {/* Modals */}
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
      </div>
    );
  })();

  return (
    <CardWrapper
      title="Hồ sơ cá nhân"
      subtitle="Thông tin tài khoản & bảo mật"
      maxWidth="max-w-6xl"
      variant="profile"
    >
      {content}
    </CardWrapper>
  );
}
