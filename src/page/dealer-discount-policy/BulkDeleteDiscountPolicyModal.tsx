/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form } from "antd";
import SelectInput from "../../components/atoms/SelectInput";
import {
  useBulkDeleteDiscountPolicies,
  useGetAllDealers,
} from "../../service/dealerDiscountPolicyService";
import { useGetVehicles } from "../../service/vehicleService";
import type { IDealer } from "../../model/Dealer";
import type { IVehicle } from "../../model/Vehicle";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { DeleteConfirm } from "../../components/organisms/DeleteConfirm";

const BulkDeleteDiscountPolicyModal = ({ open, onClose, onSuccess }: any) => {
  const [form] = Form.useForm();
  const { mutateAsync: bulkDelete, isPending } =
    useBulkDeleteDiscountPolicies();

  const { data: dealersData } = useGetAllDealers(0, 1000);
  const { data: vehiclesData } = useGetVehicles(0, 1000);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const initialValuesRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const dealerOptions =
    dealersData?.result?.data?.map((d: IDealer) => ({
      label: d.name,
      value: d.id,
    })) || [];

  const vehicleOptions =
    vehiclesData?.result?.data?.map((v: IVehicle) => ({
      label: v.model,
      value: v.id,
    })) || [];

  /* ---------------------- RESET KHI MỞ MODAL ---------------------- */
  useEffect(() => {
    if (open) {
      initializedRef.current = false;
      form.resetFields();
      setConfirmOpen(false);
      initialValuesRef.current = null;
    }
  }, [open, form]);

  /* ---------------------- CHỤP FORM BAN ĐẦU ---------------------- */
  useEffect(() => {
    if (open && !initializedRef.current) {
      initialValuesRef.current = form.getFieldsValue(true);
      initializedRef.current = true;
    }
  }, [open, form]);

  const isDirty = () => {
    if (!initializedRef.current || !initialValuesRef.current) return false;
    return (
      JSON.stringify(form.getFieldsValue(true)) !==
      JSON.stringify(initialValuesRef.current)
    );
  };

  /* ---------------------- X Á / CLICK NỀN ---------------------- */
  const requestClose = () => {
    if (!isDirty()) {
      onClose();
      return;
    }
    setConfirmOpen(true);
  };

  const handleDiscard = () => {
    form.resetFields();
    setConfirmOpen(false);
    onClose();
  };

  /* ---------------------- SUBMIT ---------------------- */
  const handleSubmit = async (values: any) => {
    const payload = {
      dealerIds: values.dealerIds,
      vehicleModelIds: values.vehicleModelIds,
    };

    try {
      await bulkDelete(payload);
      toast.success("Đã xóa chính sách hàng loạt!");
      onSuccess?.();
      onClose();
      form.resetFields();
    } catch {
      toast.error("Xóa hàng loạt thất bại!");
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={requestClose}
        onOk={() => form.submit()}
        okText="Xóa hàng loạt"
        cancelText="Hủy"
        confirmLoading={isPending}
        centered
        destroyOnClose={false}
        width={600}
        okButtonProps={{ danger: true }}
        title="Xóa hàng loạt chính sách chiết khấu"
        maskClosable
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <SelectInput
            label="Chọn đại lý (Dealers)"
            name="dealerIds"
            placeholder="Chọn đại lý cần xóa"
            options={dealerOptions}
            mode="multiple"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 đại lý" },
            ]}
          />

          <SelectInput
            label="Chọn xe (Vehicles)"
            name="vehicleModelIds"
            placeholder="Chọn xe cần xóa"
            options={vehicleOptions}
            mode="multiple"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 xe" }]}
          />
        </Form>
      </Modal>

      <DeleteConfirm
        open={confirmOpen}
        title="Hủy thao tác?"
        message="Thông tin bạn đã nhập sẽ bị xóa. Bạn có chắc chắn muốn hủy?"
        okText="Hủy thay đổi"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDiscard}
      />
    </>
  );
};

export default BulkDeleteDiscountPolicyModal;
