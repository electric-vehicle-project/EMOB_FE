import { Modal, Card } from "antd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { CustomerForm } from "./CustomerForm";
import type { CustomerFormData } from "./CustomerForm";

import {
  useCustomerById,
  useCustomerUpdate,
} from "../../../service/customerService";

import type { RootState } from "../../../redux/store";
import type { ICustomer } from "../../../model/Customer";

interface Props {
  open: boolean;
  onClose: () => void;
  customerId?: string;
  onSuccess?: () => void;
}

export const CustomerEditModal = ({
  open,
  onClose,
  customerId,
  onSuccess,
}: Props) => {
  const user = useSelector((state: RootState) => state.user);
  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";

  const { data, isLoading } = useCustomerById(customerId || "");
  const customer: ICustomer | undefined = data?.result;

  const transformed =
    customer &&
    ({
      fullName: customer.fullName ?? "",
      email: customer.email ?? "",
      phoneNumber: customer.phoneNumber ?? "",
      address: customer.address ?? "",
      note: customer.note ?? "",
      loyaltyPoints: customer.loyaltyPoints ?? 0,
      gender: customer.gender,
      dateOfBirth: customer.dateOfBirth
        ? dayjs(customer.dateOfBirth)
        : undefined,
    } satisfies Partial<CustomerFormData>);

  const { mutateAsync: updateCustomer, isPending } =
    useCustomerUpdate(customerId);

  const handleSubmit = (values: CustomerFormData): void => {
    if (!canEdit) {
      toast.warning("Bạn không có quyền chỉnh sửa khách hàng");
      return;
    }

    if (!customerId) {
      toast.error("Không thể xác định khách hàng");
      return;
    }

    updateCustomer({ id: customerId, data: values })
      .then(() => {
        toast.success("Cập nhật khách hàng thành công");
        onClose();
        onSuccess?.();
      })
      .catch(() => {
        toast.error("Không thể cập nhật khách hàng");
      });
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={600}>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Cập nhật thông tin khách hàng
      </h2>

      <Card bordered>
        <CustomerForm
          initialValues={transformed}
          onSubmit={handleSubmit}
          loading={isPending || isLoading}
          key={customerId}
        />
      </Card>
    </Modal>
  );
};

export default CustomerEditModal;
