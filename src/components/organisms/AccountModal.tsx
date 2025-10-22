import { Modal, Spin } from "antd";
import { AccountForm } from "../molecules/Account/AccountForm";
import type { AccountCreatePayload } from "../molecules/Account/AccountForm";
import { Role } from "../../model/Account";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AccountCreatePayload) => void;
  loading?: boolean;
  role: Role;
}

export const AccountModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  loading,
  role,
}) => (
  <Modal
    open={open}
    footer={null}
    onCancel={onClose}
    destroyOnClose
    centered
    width={520}
    title={
      role === Role.ADMIN
        ? "Tạo tài khoản Quản lý / Nhân viên EVM"
        : "Tạo tài khoản Nhân viên đại lý"
    }
  >
    <Spin spinning={!!loading} tip="Đang xử lý...">
      <div className="p-4 sm:p-6">
        <AccountForm onSubmit={onSubmit} loading={loading} role={role} />
      </div>
    </Spin>
  </Modal>
);
