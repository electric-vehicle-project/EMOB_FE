import { Modal, Button } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "antd/es/form/Form";
import type { IDealer, Region } from "../../../model/Dealer";
import { DealerForm } from "../../molecules/dealer/DealerForm";
import type { DealerFormValues } from "../../molecules/dealer/dealerUtils";
import {
  normalizeDealerValues,
  isSameDealerValues,
  buildDealerPayloadFromForm,
} from "../../molecules/dealer/dealerUtils";
import { useDealersQuery } from "../../../service/dealerService";
import { toast } from "react-toastify";

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

  const { data: allDealersResp, refetch: refetchAllDealers } = useDealersQuery(
    { enabled: open },
    { page: 0, size: 1000, sortField: "createdAt", sortDir: "desc" }
  );

  const allDealers: IDealer[] = useMemo(
    () => allDealersResp?.result?.data ?? [],
    [allDealersResp]
  );

  useEffect(() => {
    if (!open) return;

    refetchAllDealers();

    if (initialValues) {
      // ✅ Khi chỉnh sửa: set đúng giá trị cũ (nếu có)
      form.setFieldsValue({
        name: initialValues.name,
        emailContact: initialValues.emailContact,
        phoneContact: initialValues.phoneContact,
        country: initialValues.country,
        address: initialValues.address || "",
        region: initialValues.region as Region,
      });
    } else {
      // ✅ Khi thêm mới: reset sạch form, không set region mặc định
      form.resetFields();
    }

    // Cập nhật baseline cho logic dirty-check
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
        toast.info("Bạn chưa thay đổi gì.");
        return;
      }
    }

    try {
      const payload = buildDealerPayloadFromForm(current);
      await onSubmit(payload as unknown as IDealer);
    } catch (err: unknown) {
      interface ApiError {
        response?: { data?: { message?: string } };
        message?: string;
      }
      const e = err as ApiError;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Không thể lưu. Vui lòng thử lại.";
      toast.error(msg);
    }
  };

  const footer = (
    <div className="flex justify-center">
      <Button
        type="primary"
        className={`px-6 py-2 rounded-md w-full sm:w-auto ${
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
      destroyOnClose
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
