import { Modal, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import { usePromotionById } from "../../../service/promotionService";
import type { Promotion } from "../../../model/Promotion";

interface Props {
  open: boolean;
  onClose: () => void;
  promotionId?: string;
}

export const PromotionDetailModal = ({ open, onClose, promotionId }: Props) => {
  const { data, isLoading } = usePromotionById(promotionId || "");
  const promotion: Promotion | undefined = data?.result;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={620}>
      <h2 className="text-xl font-semibold text-[#627254] mb-4">
        Chi tiết khuyến mãi
      </h2>

      {isLoading || !promotion ? (
        <Skeleton active />
      ) : (
        <div className="space-y-3 text-[15px]">
          <p>
            <b>Tên chương trình:</b> {promotion.name}
          </p>

          <p>
            <b>Loại:</b>{" "}
            <Tag color="purple">
              {promotion.type === "PERCENTAGE"
                ? "Giảm theo %"
                : promotion.type === "FIXED_AMOUNT"
                ? "Giảm số tiền"
                : "Điểm thưởng"}
            </Tag>
          </p>

          <p>
            <b>Giá trị:</b>{" "}
            {promotion.type === "PERCENTAGE"
              ? `${promotion.value}%`
              : `${promotion.value?.toLocaleString("vi-VN")} ₫`}
          </p>

          <p>
            <b>Thời gian:</b> {dayjs(promotion.startDate).format("DD/MM/YYYY")}{" "}
            – {dayjs(promotion.endDate).format("DD/MM/YYYY")}
          </p>

          <p>
            <b>Mô tả:</b> {promotion.description || "—"}
          </p>
        </div>
      )}
    </Modal>
  );
};

export default PromotionDetailModal;
