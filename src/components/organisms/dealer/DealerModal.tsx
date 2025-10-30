import { Modal, Button, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "antd/es/form/Form";
import type { IDealer } from "../../../model/Dealer";
import { DealerForm } from "../../molecules/dealer/DealerForm";
import type { DealerFormValues } from "../../molecules/dealer/dealerUtils";
import {
  normalizeDealerValues,
  isSameDealerValues,
} from "../../molecules/dealer/dealerUtils";
import { useDealers } from "../../../service/dealerService";

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
  const [canSubmit, setCanSubmit] = useState(false);
  const baselineRef = useRef<DealerFormValues | null>(null);

  // Dataset để check trùng
  const { data: allDealersResp, refetch: refetchAllDealers } = useDealers(
    { queryKey: ["dealers", "all"] },
    { page: 0, size: 1000 }
  );
  const allDealers: IDealer[] = useMemo(
    () => allDealersResp?.result?.data ?? [],
    [allDealersResp]
  );

  useEffect(() => {
    if (!open) return;

    refetchAllDealers();

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        contactInfo: initialValues.contactInfo,
        country: initialValues.country,
        address: initialValues.address,
      });
    } else {
      form.resetFields(); // không validate -> không đỏ sẵn
    }

    // chụp baseline (đã normalize) sau 1 tick
    const id = setTimeout(() => {
      baselineRef.current = normalizeDealerValues(form.getFieldsValue());
      setCanSubmit(false);
    }, 0);

    return () => clearTimeout(id);
  }, [open, initialValues, form, refetchAllDealers]);

  const handleFinish = async (values: DealerFormValues) => {
    const current = normalizeDealerValues(values);

    if (initialValues) {
      const base =
        baselineRef.current ?? normalizeDealerValues(form.getFieldsValue());
      if (isSameDealerValues(current, base)) {
        message.info("Bạn chưa thay đổi gì.");
        return;
      }
    }

    try {
      await onSubmit(current as unknown as IDealer);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể lưu. Vui lòng thử lại.";
      message.error(msg);
    }
  };

  const footer = (
    <div className="flex justify-center">
      <Button
        type="primary"
        className={`px-6 py-2 rounded-md w-full sm:w-auto transition-all duration-150 ${
          !canSubmit
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-evm-green hover:!bg-[#4f6f52]"
        }`}
        disabled={!canSubmit}
        onClick={() => form.submit()}
      >
        {initialValues ? "Lưu thay đổi" : "Tạo đại lý"}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      title={initialValues ? "Sửa thông tin đại lý" : "Thêm đại lý mới"}
      onCancel={onClose}
      footer={footer}
      destroyOnHidden
      centered
    >
      <DealerForm
        open={open}
        form={form}
        isEdit={!!initialValues}
        currentId={initialValues?.id}
        existingDealers={allDealers}
        onFinish={handleFinish}
        onCanSubmitChange={setCanSubmit}
        baseline={baselineRef.current}
      />
    </Modal>
  );
};
