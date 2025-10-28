import { Tabs, Select, Row, Col, Space, Typography, Tag } from "antd";
import type { TabsProps } from "antd";
import { useState } from "react";

const { Title } = Typography;

export interface FilterOption {
  label: string;
  key: string;
  count?: number;
}

interface Props {
  counts?: Record<string, number>; // { all, active, upcoming, expired }
  defaultScope?: "GLOBAL" | "LOCAL";
  onScopeChange?: (scope: "GLOBAL" | "LOCAL") => void;
  onStatusChange?: (status: string) => void;
}

/**
 * Thanh lọc và đếm promotions theo trạng thái + phạm vi (GLOBAL / LOCAL)
 * Dùng cho DealerPromotionsPage và EvmPromotionsPage
 */
export const PromotionFilterBar = ({
  counts,
  defaultScope = "GLOBAL",
  onScopeChange,
  onStatusChange,
}: Props) => {
  const [scope, setScope] = useState<"GLOBAL" | "LOCAL">(defaultScope);

  const items: TabsProps["items"] = [
    {
      key: "ALL",
      label: (
        <Space>
          <span>Tất cả</span>
          <Tag color="default">{counts?.all ?? 0}</Tag>
        </Space>
      ),
    },
    {
      key: "ACTIVE",
      label: (
        <Space>
          <span>Đang hoạt động</span>
          <Tag color="green">{counts?.active ?? 0}</Tag>
        </Space>
      ),
    },
    {
      key: "UPCOMING",
      label: (
        <Space>
          <span>Sắp diễn ra</span>
          <Tag color="blue">{counts?.upcoming ?? 0}</Tag>
        </Space>
      ),
    },
    {
      key: "EXPIRED",
      label: (
        <Space>
          <span>Đã hết hạn</span>
          <Tag color="red">{counts?.expired ?? 0}</Tag>
        </Space>
      ),
    },
  ];

  const handleScopeChange = (value: "GLOBAL" | "LOCAL") => {
    setScope(value);
    onScopeChange?.(value);
  };

  const handleTabChange = (key: string) => {
    onStatusChange?.(key);
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={4} className="m-0 text-[#627254]">
            Danh sách khuyến mãi
          </Title>
        </Col>
        <Col>
          <Select
            value={scope}
            onChange={handleScopeChange}
            options={[
              { label: "Toàn hệ thống", value: "GLOBAL" },
              { label: "Cục bộ (Đại lý)", value: "LOCAL" },
            ]}
            style={{ width: 180 }}
          />
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="ALL"
        items={items}
        onChange={handleTabChange}
        className="mt-3"
      />
    </div>
  );
};
