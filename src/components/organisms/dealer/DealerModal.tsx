/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Button } from "antd";
import { useEffect, useRef, useState } from "react";
import { useForm } from "antd/es/form/Form";
import type { IDealer, Region } from "../../../model/Dealer";
import { DealerForm } from "../../molecules/dealer/DealerForm";
import type { DealerFormValues } from "../../molecules/dealer/dealerUtils";
import {
  normalizeDealerValues,
  isSameDealerValues,
  buildDealerPayloadFromForm,
} from "../../molecules/dealer/dealerUtils";
import { DeleteConfirm } from "../DeleteConfirm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IDealer) => Promise<void> | void;
  initialValues?: IDealer;
}

export const DealerModal = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}: Props) => {
  const [form] = useForm<DealerFormValues>();
  const baselineRef = useRef<DealerFormValues | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        emailContact: initialValues.emailContact,
        phoneContact: initialValues.phoneContact,
        country: initialValues.country,
        address: initialValues.address || "",
        region: initialValues.region as Region,
      });
    } else {
      form.resetFields();
    }

    const id = setTimeout(() => {
      baselineRef.current = normalizeDealerValues(form.getFieldsValue());
    }, 0);

    return () => clearTimeout(id);
  }, [open, initialValues, form]);

  const handleFinish = async (values: DealerFormValues) => {
    const current = normalizeDealerValues(values);

    try {
      const payload = buildDealerPayloadFromForm(current);
      await onSubmit(payload as any);
    } catch (err: any) {
      const msg = err?.response?.data?.message?.toLowerCase() || "";

      if (msg.includes("email")) {
        form.setFields([
          { name: "emailContact", errors: ["Email đã tồn tại"] },
        ]);
      }

      if (msg.includes("phone")) {
        form.setFields([
          { name: "phoneContact", errors: ["Số điện thoại đã tồn tại"] },
        ]);
      }

      return;
    }
  };

  const handleRequestClose = () => {
    const baseline =
      baselineRef.current ?? normalizeDealerValues(form.getFieldsValue());
    const current = normalizeDealerValues(form.getFieldsValue());
    const hasChanges = !isSameDealerValues(current, baseline);

    if (!hasChanges) return onClose();

    setConfirmDiscardOpen(true);
  };

  const footer = (
    <div className="flex justify-center">
      <Button
        type="primary"
        className="px-6 py-2 rounded-md w-full sm:w-auto bg-evm-green hover:!bg-[#4f6f52]"
        onClick={() => form.submit()}
      >
        {initialValues ? "Lưu thay đổi" : "Tạo đại lý"}
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        title={initialValues ? "Sửa thông tin đại lý" : "Thêm đại lý mới"}
        onCancel={handleRequestClose}
        footer={footer}
        destroyOnClose
        centered
      >
        <DealerForm
          open={open}
          form={form}
          isEdit={!!initialValues}
          currentId={initialValues?.id}
          onFinish={handleFinish}
          baseline={baselineRef.current}
        />
      </Modal>

      <DeleteConfirm
        open={confirmDiscardOpen}
        onCancel={() => setConfirmDiscardOpen(false)}
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          onClose();
        }}
        message="Các thay đổi chưa được lưu sẽ bị mất. Bạn có chắc chắn?"
        okText="Hủy thay đổi"
        danger
      />
    </>
  );
};
