import { Modal, Skeleton } from "antd";
import { useCustomerById } from "../../../service/customerService";
import { CustomerInfoCard } from "../../molecules/customer/CustomerInfoCard";
import type { ICustomer } from "../../../model/Customer";

interface Props {
  open: boolean;
  onClose: () => void;
  customerId?: string;
}

export const CustomerDetailModal = ({ open, onClose, customerId }: Props) => {
  const { data, isLoading } = useCustomerById(customerId || "");
  const customer: ICustomer | undefined = data?.result;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={600}>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Thông tin khách hàng
      </h2>

      {isLoading || !customer ? (
        <Skeleton active />
      ) : (
        <CustomerInfoCard customer={customer} />
      )}
    </Modal>
  );
};

export default CustomerDetailModal;
