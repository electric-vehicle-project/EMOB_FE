import { Modal, Card } from "antd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { CustomerForm, type CustomerFormData } from "./CustomerForm";
import { useCustomerCreate } from "../../../service/customerService";
import type { RootState } from "../../../redux/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CustomerCreateModal = ({ open, onClose }: Props) => {
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
      onClose();
    } catch {
      toast.error("Không thể tạo khách hàng");
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={600}>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Thêm khách hàng mới
      </h2>

      <Card bordered>
        <CustomerForm onSubmit={handleSubmit} loading={isPending} />
      </Card>
    </Modal>
  );
};

export default CustomerCreateModal;
