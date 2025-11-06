import { useParams, useNavigate } from "react-router-dom";
import { message, Skeleton, Card } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import {
  useCustomerById,
  useCustomerUpdate,
} from "../../service/customerService";
import { CustomerForm } from "../../components/organisms/customer/CustomerForm";
import { CardWrapper } from "../../components/template/CardWrapper";

export const CustomerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const role = (user as any)?.role as "MANAGER" | "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";

  const { data, isLoading } = useCustomerById(id || "");
  const { mutateAsync: updateCustomer, isPending } = useCustomerUpdate();

  const customer = data?.result;

  const handleSubmit = async (values: any) => {
    if (!canEdit) {
      message.warning("Bạn không có quyền chỉnh sửa khách hàng!");
      return;
    }
    try {
      await updateCustomer({ id, ...values });
      message.success("Cập nhật khách hàng thành công!");
      navigate("/dealer_staff/customers");
    } catch {
      message.error("Không thể cập nhật khách hàng, vui lòng thử lại.");
    }
  };

  if (isLoading || !customer)
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
          mode="edit"
          initialValues={customer}
          onSubmit={handleSubmit}
          loading={isPending}
        />
      </Card>
    </CardWrapper>
  );
};

export default CustomerEditPage;
