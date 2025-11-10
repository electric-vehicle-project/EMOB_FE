import { useParams, useNavigate } from "react-router-dom";
import { Skeleton, Card } from "antd";
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

export const CustomerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user);
  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";

  const { data, isLoading } = useCustomerById(id || "");
  const { mutateAsync: updateCustomer, isPending } = useCustomerUpdate(id);

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

    if (!id) {
      toast.error("Không thể xác định ID khách hàng để cập nhật!");
      return;
    }

    try {
      await updateCustomer({ id, data: values });
      toast.success("Cập nhật khách hàng thành công!");
      navigate("/dealer_staff/customers");
    } catch {
      toast.error("Không thể cập nhật khách hàng, vui lòng thử lại!");
    }
  };

  if (isLoading || !transformedCustomer)
    return (
      <CardWrapper>
        <Skeleton active />
      </CardWrapper>
    );

  return (
    <CardWrapper>
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
    </CardWrapper>
  );
};

export default CustomerEditPage;
