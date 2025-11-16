// src/components/molecules/Account/AccountRoleSelectModal.tsx
import { Modal, Space } from "antd";
import { Button as EmobButton } from "../../atoms/Button";
import { Role } from "../../../model/Account";

interface Props {
  open: boolean;
  onSelect: (role: Role) => void;
  onClose: () => void;
  currentUserRole: Role;
}

export const AccountRoleSelectModal: React.FC<Props> = ({
  open,
  onSelect,
  onClose,
  currentUserRole,
}) => {
  const handleSelect = (role: Role) => {
    onSelect(role);
    onClose();
  };

  const adminOptions = [
    { label: "Quản lý đại lý", value: Role.MANAGER },
    { label: "Nhân viên EVM", value: Role.EVM_STAFF },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title="Chọn loại tài khoản muốn tạo"
    >
      <Space direction="vertical" className="w-full">
        {currentUserRole === Role.ADMIN &&
          adminOptions.map((r) => (
            <EmobButton
              key={r.value}
              type="primary"
              className="w-full text-base py-2 rounded-lg"
              onClick={() => handleSelect(r.value)}
            >
              {r.label}
            </EmobButton>
          ))}
      </Space>
    </Modal>
  );
};
