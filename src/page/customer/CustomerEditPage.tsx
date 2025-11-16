import { useNavigate } from "react-router-dom";
import { Skeleton, Card, Modal } from "antd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import type { RootState } from "../../redux/store";
import {
  useCustomerById,
  useCustomerUpdate,
} from "../../service/customerService";
import { CardWrapper } from "../../components/template/CardWrapper";
import type { ICustomer } from "../../model/Customer";
import { CustomerForm } from "../../components/organisms/customer/CustomerForm";

interface CustomerFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth?: string | Date;
  gender?: "MALE" | "FEMALE";
  loyaltyPoints?: number;
  note?: string;
}

interface CustomerEditPageProps {
  open?: boolean;
  onClose?: () => void;
  customerId?: string;
}

export const CustomerEditPage: React.FC<CustomerEditPageProps> = ({
  open,
  onClose,
  customerId,
}) => {
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user);
  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";

  const { data } = useCustomerById(customerId || "");
  const { mutateAsync: updateCustomer, isPending } =
    useCustomerUpdate(customerId);

  const customer: ICustomer | undefined = data?.result;

  const transformedCustomer = customer
    ? {
        ...customer,
        dateOfBirth: customer.dateOfBirth
          ? dayjs(customer.dateOfBirth)
          : undefined,
      }
    : undefined;

  const handleSubmit = async (values: CustomerFormData): Promise<void> => {
    if (!canEdit) {
      toast.warning("Bạn không có quyền chỉnh sửa khách hàng!");
      return;
    }

    if (!customerId) {
      toast.error("Không thể xác định ID khách hàng để cập nhật!");
      return;
    }

    try {
      await updateCustomer({ id: customerId, data: values });
      toast.success("Cập nhật khách hàng thành công!");
      navigate("/dealer_staff/customers");
    } catch {
      toast.error("Không thể cập nhật khách hàng, vui lòng thử lại!");
    }
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={600}
    >
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Cập nhật thông tin khách hàng
      </h2>
      <Card bordered>
        <CustomerForm
          initialValues={transformedCustomer}
          onSubmit={handleSubmit}
          loading={isPending}
        />
      </Card>
    </Modal>
  );
};

export default CustomerEditPage;
