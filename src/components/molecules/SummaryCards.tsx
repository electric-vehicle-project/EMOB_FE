import React from "react";
import { Row, Col, Card, Statistic } from "antd";

export interface SummaryCardProps {
  imported: string | number;
  exported: string | number;
  remaining: string | number;
  debt: string | number;
}

const SummaryCards: React.FC<SummaryCardProps> = ({
  imported,
  exported,
  remaining,
  debt,
}) => (
  <Row gutter={[24, 24]} justify="center">
    <Col xs={24} sm={12} md={6}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Statistic
          title="Xe nhập kho"
          value={imported}
          valueStyle={{ color: "#1e1e6e" }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Statistic
          title="Xe xuất kho"
          value={exported}
          valueStyle={{ color: "#1e1e6e" }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Statistic
          title="Tồn kho"
          value={remaining}
          valueStyle={{ color: "#1e1e6e" }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Statistic
          title="Công nợ"
          value={debt}
          valueStyle={{ color: "#1e1e6e" }}
        />
      </Card>
    </Col>
  </Row>
);

export default SummaryCards;
