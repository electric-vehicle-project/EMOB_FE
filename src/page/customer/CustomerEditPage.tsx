import { useParams, useNavigate } from "react-router-dom";
import { message, Skeleton, Card } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
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

  // FETCH CUSTOMER DETAIL
  const { data, isLoading } = useCustomerById(id || "");
  const { mutateAsync: updateCustomer, isPending } = useCustomerUpdate(id);

  const customer = data?.result;

  const transformedCustomer = customer
    ? {
        ...customer,
        dateOfBirth: customer.dateOfBirth ? dayjs(customer.dateOfBirth) : null,
      }
    : null;

  // HANDLE SUBMIT
  const handleSubmit = async (values: any) => {
    if (!canEdit) {
      message.warning("Bạn không có quyền chỉnh sửa khách hàng!");
      return;
    }

    if (!id) {
      message.error("Không thể xác định ID khách hàng để cập nhật.");
      return;
    }

    try {
      await updateCustomer({ id, data: values });

      message.success("Cập nhật khách hàng thành công!");
      navigate("/dealer_staff/customers");
    } catch (err) {
      console.error("Customer update failed:", err);
      message.error("Không thể cập nhật khách hàng, vui lòng thử lại.");
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
          mode="edit"
          initialValues={transformedCustomer}
          onSubmit={handleSubmit}
          loading={isPending}
        />
      </Card>
    </CardWrapper>
  );
};

export default CustomerEditPage;
