import { useNavigate } from "react-router-dom";
import { Card } from "antd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { RootState } from "../../redux/store";
import { CustomerForm } from "../../components/organisms/customer/CustomerForm";
import { useCustomerCreate } from "../../service/customerService";
import { CardWrapper } from "../../components/template/CardWrapper";

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

export const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const { mutateAsync: createCustomer, isPending } = useCustomerCreate();

  // Chỉ DEALER_STAFF được phép tạo khách hàng
  const role = (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";
  const canCreate = role === "DEALER_STAFF";

  const handleSubmit = async (values: CustomerFormData): Promise<void> => {
    if (!canCreate) {
      toast.warning("Bạn không có quyền tạo khách hàng!");
      return;
    }

    try {
      await createCustomer(values);
      toast.success("Tạo khách hàng thành công!");
      navigate("/dealer_staff/customers");
    } catch {
      toast.error("Không thể tạo khách hàng, vui lòng thử lại!");
    }
  };

  return (
    <CardWrapper>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Thêm khách hàng mới
      </h2>

      <Card bordered>
        <CustomerForm onSubmit={handleSubmit} loading={isPending} />
      </Card>
    </CardWrapper>
  );
};

export default CustomerCreatePage;
