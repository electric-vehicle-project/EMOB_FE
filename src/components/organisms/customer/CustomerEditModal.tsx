import { Modal, Card, Form } from "antd";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import { CustomerForm, type CustomerFormData } from "./CustomerForm";
import {
  useCustomerById,
  useCustomerUpdate,
} from "../../../service/customerService";
import type { RootState } from "../../../redux/store";
import type { ICustomer } from "../../../model/Customer";
import { DeleteConfirm } from "../DeleteConfirm";

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
  const [form] = Form.useForm<CustomerFormData>();
  const baselineRef = useRef<CustomerFormData | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const role: "MANAGER" | "DEALER_STAFF" =
    (user?.role as "MANAGER" | "DEALER_STAFF") ?? "DEALER_STAFF";
  const canEdit = role === "DEALER_STAFF";

  const { data, isLoading } = useCustomerById(customerId || "");
  const customer: ICustomer | undefined = data?.result;

  const transformed = useMemo(() => {
    if (!customer) return undefined;

    return {
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
    };
  }, [customer]);

  const { mutateAsync: updateCustomer, isPending } =
    useCustomerUpdate(customerId);

  useEffect(() => {
    if (!open) return;

    if (transformed) {
      form.setFieldsValue(transformed);
    }

    const id = setTimeout(() => {
      baselineRef.current = form.getFieldsValue();
    }, 0);

    return () => clearTimeout(id);
  }, [open, transformed, form]);

  const handleSubmit = async (values: CustomerFormData) => {
    if (!canEdit) {
      toast.warning("Bạn không có quyền chỉnh sửa khách hàng");
      return;
    }

    if (!customerId) {
      toast.error("Không thể xác định khách hàng");
      return;
    }

    try {
      await updateCustomer({ id: customerId, data: values });
      toast.success("Cập nhật khách hàng thành công");
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch {
      toast.error("Không thể cập nhật khách hàng");
    }
  };

  const handleRequestClose = () => {
    const baseline = baselineRef.current ?? form.getFieldsValue();
    const current = form.getFieldsValue();

    const hasChanges = JSON.stringify(current) !== JSON.stringify(baseline);

    if (!hasChanges) {
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
          Cập nhật thông tin khách hàng
        </h2>

        <Card bordered>
          <CustomerForm
            form={form}
            initialValues={transformed}
            onSubmit={handleSubmit}
            loading={isPending || isLoading}
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

export default CustomerEditModal;
