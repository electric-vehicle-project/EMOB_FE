import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Spin, message, Tag, Divider } from "antd";
import axios from "axios";
import type { IQuotationItem } from "../../model/Quotation";

interface ViewQuotationModalProps {
  open?: boolean;
  quotationId?: string;
  onClose?: () => void;
}

const ViewQuotationDetailModal: React.FC<ViewQuotationModalProps> = ({
  open,
  quotationId,
  onClose,
}) => {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/quotations/${quotationId}`);
      setQuotation(res.data.result);
    } catch (error) {
      console.error(error);
      message.error("Failed to load quotation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId && open) fetchQuotation();
  }, [quotationId, open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={750}
      destroyOnClose
      title={<span className="text-lg font-semibold">Chi tiết báo giá</span>}
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : quotation ? (
        <>
          {/* 🟢 Thông tin tổng quan */}
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Quotation ID" span={2}>
              {quotation.id}
            </Descriptions.Item>
            <Descriptions.Item label="Customer ID">
              {quotation.customerId}
            </Descriptions.Item>
            <Descriptions.Item label="Dealer ID">
              {quotation.dealerId}
            </Descriptions.Item>
            <Descriptions.Item label="Account ID">
              {quotation.accountId}
            </Descriptions.Item>
            <Descriptions.Item label="Total Quantity">
              {quotation.totalQuantity}
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              ${quotation.totalPrice?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  quotation.status === "PENDING"
                    ? "gold"
                    : quotation.status === "APPROVED"
                    ? "green"
                    : "red"
                }
              >
                {quotation.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Valid Until (days)">
              {quotation.validUntil}
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {new Date(quotation.createdAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          {/* 🟠 Danh sách xe trong báo giá */}
          <Divider orientation="left" className="mt-6">
            Vehicle Items
          </Divider>

          {quotation.items?.length ? (
            quotation.items.map((item: IQuotationItem, idx: number) => (
              <Descriptions
                key={item.id || idx}
                bordered
                column={2}
                size="small"
                className="mb-4"
              >
                <Descriptions.Item label="Vehicle ID">
                  {item.vehicleId}
                </Descriptions.Item>
                <Descriptions.Item label="Promotion ID">
                  {item.promotionId}
                </Descriptions.Item>
                <Descriptions.Item label="Vehicle Status">
                  <Tag color="blue">{item.vehicleStatus}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Color">
                  {item.color}
                </Descriptions.Item>
                <Descriptions.Item label="Quantity">
                  {item.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Unit Price">
                  ${item.unitPrice?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Discount Price">
                  ${item.discountPrice?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Total Price">
                  ${item.totalPrice?.toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            ))
          ) : (
            <p className="text-gray-500 italic mt-2">
              No vehicle items available.
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500 italic">No quotation data found.</p>
      )}
    </Modal>
  );
};

export default ViewQuotationDetailModal;
