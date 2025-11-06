import { useNavigate } from "react-router-dom";
import { message, Card } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { CustomerForm } from "../../components/organisms/customer/CustomerForm";
import { useCustomerCreate } from "../../service/customerService";
import { CardWrapper } from "../../components/template/CardWrapper";

export const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const { mutateAsync: createCustomer, isPending } = useCustomerCreate();

  // Chỉ DEALER_STAFF mới được phép tạo khách hàng
  const role = (user as any)?.role as "MANAGER" | "DEALER_STAFF";
  const canCreate = role === "DEALER_STAFF";

  const handleSubmit = async (values: any) => {
    if (!canCreate) {
      message.warning("Bạn không có quyền tạo khách hàng!");
      return;
    }
    try {
      await createCustomer(values);
      message.success("Tạo khách hàng thành công!");
      navigate("/dealer_staff/customers");
    } catch {
      message.error("Không thể tạo khách hàng, vui lòng thử lại.");
    }
  };

  return (
    <CardWrapper>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Thêm khách hàng mới
      </h2>

      <Card bordered>
        <CustomerForm
          mode="create"
          onSubmit={handleSubmit}
          loading={isPending}
        />
      </Card>
    </CardWrapper>
  );
};

export default CustomerCreatePage;
