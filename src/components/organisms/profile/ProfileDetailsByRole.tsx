// src/components/organisms/profile/ProfileDetailsByRole.tsx
import React from "react";
import { Descriptions } from "antd";
import { formatDateVietnam } from "../../../utils/timeFeature";
import type { IAccount } from "../../../model/Account";

interface Props {
  profile: IAccount;
  dealerName?: string; // nếu có quyền và lấy được thì truyền vào
}

const genderLabel = (g?: IAccount["gender"]) =>
  g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "Không xác định";

const ProfileDetailsByRole: React.FC<Props> = ({ profile, dealerName }) => {
  const baseItems = (
    <>
      <Descriptions.Item label="Số điện thoại">
        {profile.phone || "-"}
      </Descriptions.Item>
      <Descriptions.Item label="Giới tính">
        {genderLabel(profile.gender)}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày sinh">
        {profile.dateOfBirth ? formatDateVietnam(profile.dateOfBirth) : "-"}
      </Descriptions.Item>
      <Descriptions.Item label="Địa chỉ">
        {profile.address || "-"}
      </Descriptions.Item>
    </>
  );

  // Chỉ hiện "Đại lý trực thuộc" khi có tên (đã được phía ngoài kiểm soát quyền gọi API)
  const showDealer = !!dealerName;

  return (
    <Descriptions className="mt-2" column={2} size="middle" bordered>
      {baseItems}
      {showDealer && (
        <Descriptions.Item label="Đại lý trực thuộc" span={2}>
          {dealerName}
        </Descriptions.Item>
      )}
    </Descriptions>
  );
};

export default ProfileDetailsByRole;
