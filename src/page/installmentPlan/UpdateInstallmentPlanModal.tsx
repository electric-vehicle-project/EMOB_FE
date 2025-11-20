/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Modal, InputNumber, message } from "antd";
import { useInstallmentPlanUpdate } from "../../service/installmentPlanService";

interface UpdateAmountPaidModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
  currentAmount?: number;
}

export const UpdateAmountPaidModal = ({
  id,
  open,
  onClose,
  currentAmount,
}: UpdateAmountPaidModalProps) => {
  const [amountPaid, setAmountPaid] = useState(currentAmount || 0);

  const updateMutation = useInstallmentPlanUpdate(id);

  useEffect(() => {
    if (open) setAmountPaid(currentAmount || 0);
  }, [open, currentAmount]);

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { amountPaid },
      });

      message.success("Cập nhật số tiền đã thanh toán thành công!");
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Cập nhật thất bại!");
    }
  };
  const parseNumberInput = (v: string | undefined): number => {
    const parsed = Number((v || "").toString().replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  return (
    <Modal
      title="Cập nhật số tiền đã thanh toán"
      onCancel={onClose}
      onOk={handleUpdate}
      okText="Lưu"
      open={open}
    >
      <div className="flex flex-col gap-3">
        <label>Số tiền đã thanh toán</label>
        <InputNumber
          min={0}
          className="w-full"
          size="large"
          addonAfter="₫"
          value={amountPaid}
          onChange={(v) => setAmountPaid(v ?? 0)}
          formatter={(value) =>
            value != null
              ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : ""
          }
          parser={parseNumberInput}
        />
      </div>
    </Modal>
  );
};
