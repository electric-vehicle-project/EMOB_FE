import { Modal, Card, Form } from "antd";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";

import { CustomerForm, type CustomerFormData } from "./CustomerForm";
import { useCustomerCreate } from "../../../service/customerService";
import type { RootState } from "../../../redux/store";
import { DeleteConfirm } from "../DeleteConfirm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CustomerCreateModal = ({ open, onClose }: Props) => {
  const [form] = Form.useForm<CustomerFormData>();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";
  const canCreate = role === "DEALER_STAFF";

  const { mutateAsync: createCustomer, isPending } = useCustomerCreate();

  const handleSubmit = async (values: CustomerFormData) => {
    if (!canCreate) {
      toast.warning("Bạn không có quyền tạo khách hàng");
      return;
    }

    try {
      await createCustomer(values);
      toast.success("Tạo khách hàng thành công");
      form.resetFields();
      onClose();
    } catch {
      toast.error("Không thể tạo khách hàng");
    }
  };

  const handleRequestClose = () => {
    if (!form.isFieldsTouched()) {
      form.resetFields();
      onClose();
      return;
    }
    setConfirmVisible(true);
  };

  const handleConfirmDiscard = () => {
    setConfirmVisible(false);
    form.resetFields();
    onClose();
  };

  const handleCancelDiscard = () => {
    setConfirmVisible(false);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={handleRequestClose}
        footer={null}
        width={600}
      >
        <h2 className="text-xl font-semibold text-[#627254] mb-4">
          Thêm khách hàng mới
        </h2>

        <Card bordered>
          <CustomerForm
            form={form}
            onSubmit={handleSubmit}
            loading={isPending}
          />
        </Card>
      </Modal>

      <DeleteConfirm
        open={confirmVisible}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
        message="Các thay đổi sẽ không được lưu. Bạn có chắc chắn muốn hủy?"
        okText="Bỏ thay đổi"
        danger={false}
        title="Xác nhận hủy"
      />
    </>
  );
};

export default CustomerCreateModal;
