// src/components/organisms/profile/ProfileDetailsByRole.tsx
import React from "react";
import { Descriptions } from "antd";
import { formatDateVietnam } from "../../../utils/timeFeature";
import type { IAccount, Role } from "../../../model/Account";

interface Props {
  profile: IAccount;
}

const ProfileDetailsByRole: React.FC<Props> = ({ profile }) => {
  const baseItems = (
    <>
      <Descriptions.Item label="Số điện thoại">
        {profile.phone || "-"}
      </Descriptions.Item>
      <Descriptions.Item label="Giới tính">
        {profile.gender === "MALE"
          ? "Nam"
          : profile.gender === "FEMALE"
          ? "Nữ"
          : "Không xác định"}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày sinh">
        {profile.dateOfBirth ? formatDateVietnam(profile.dateOfBirth) : "-"}
      </Descriptions.Item>
      <Descriptions.Item label="Địa chỉ">
        {profile.address || "-"}
      </Descriptions.Item>
    </>
  );

  const renderExtraFields = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return (
          <>
            <Descriptions.Item label="Tổng số đại lý">18</Descriptions.Item>
            <Descriptions.Item label="Tổng số nhân viên EVM">
              32
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo tài khoản">
              {profile.createdAt
                ? formatDateVietnam(profile.createdAt)
                : "Không có dữ liệu"}
            </Descriptions.Item>
          </>
        );

      case "MANAGER":
        return (
          <>
            <Descriptions.Item label="Đại lý quản lý">
              {profile.dealerId || "Không có dữ liệu"}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng nhân viên quản lý">
              12
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo tài khoản">
              {profile.createdAt
                ? formatDateVietnam(profile.createdAt)
                : "Không có dữ liệu"}
            </Descriptions.Item>
          </>
        );

      case "DEALER_STAFF":
        return (
          <>
            <Descriptions.Item label="Đại lý trực thuộc">
              {profile.dealerId || "Không có dữ liệu"}
            </Descriptions.Item>
            <Descriptions.Item label="Chức danh">
              Nhân viên bán hàng
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tham gia">
              {profile.createdAt
                ? formatDateVietnam(profile.createdAt)
                : "Không có dữ liệu"}
            </Descriptions.Item>
          </>
        );

      case "EVM_STAFF":
        return (
          <>
            <Descriptions.Item label="Khu vực phụ trách">
              Miền Nam
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tham gia">
              {profile.createdAt
                ? formatDateVietnam(profile.createdAt)
                : "Không có dữ liệu"}
            </Descriptions.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Descriptions className="mt-4" column={2} size="middle" bordered>
      {baseItems}
      {renderExtraFields(profile.role)}
    </Descriptions>
  );
};

export default ProfileDetailsByRole;
