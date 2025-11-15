import { Modal, Descriptions, Tag } from "antd";
import {
  AccountStatus,
  Gender,
  Role,
  type IAccount,
  type AccountStatus as AccountStatusType,
  type Gender as GenderType,
  type Role as RoleType,
} from "../../../model/Account";

interface Props {
  open: boolean;
  account: IAccount | null;
  onClose: () => void;
  dealerName?: string;
}

const STATUS_CONFIG: Record<
  AccountStatusType,
  {
    label: string;
    color: string;
  }
> = {
  [AccountStatus.ACTIVE]: {
    label: "Hoạt động",
    color: "green",
  },
  [AccountStatus.INACTIVE]: {
    label: "Ngừng hoạt động",
    color: "orange",
  },
  [AccountStatus.BANNED]: {
    label: "Đã cấm",
    color: "red",
  },
};

const ROLE_LABEL: Record<RoleType, string> = {
  [Role.ADMIN]: "Quản trị viên",
  [Role.MANAGER]: "Quản lý đại lý",
  [Role.DEALER_STAFF]: "Nhân viên đại lý",
  [Role.EVM_STAFF]: "Nhân viên EVM",
};

const GENDER_LABEL: Record<GenderType, string> = {
  [Gender.MALE]: "Nam",
  [Gender.FEMALE]: "Nữ",
  [Gender.UNKNOWN]: "Khác",
};

export const AccountDetailModal: React.FC<Props> = ({
  open,
  account,
  onClose,
  dealerName,
}) => {
  if (!account) return null;

  const dobLabel = account.dateOfBirth
    ? new Date(account.dateOfBirth).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  const statusConfig = STATUS_CONFIG[account.status];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title="Thông tin tài khoản"
    >
      <Descriptions column={1} size="middle" bordered>
        <Descriptions.Item label="Họ và tên">
          {account.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{account.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {account.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {GENDER_LABEL[account.gender]}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{dobLabel}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{account.address}</Descriptions.Item>
        <Descriptions.Item label="Vai trò">
          <Tag>{ROLE_LABEL[account.role]}</Tag>
        </Descriptions.Item>
        {dealerName ? (
          <Descriptions.Item label="Đại lý quản lý">
            {dealerName}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
