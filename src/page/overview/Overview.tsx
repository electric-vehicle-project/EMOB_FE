import React, { useEffect, useState } from "react";
import { Divider, Row, Col, Drawer, Button, Card } from "antd";
import SectionTitle from "../../components/atoms/SectionTitle";

import InventoryChart from "../../components/organisms/Inventory";

import type { InventoryProps } from "../../components/molecules/InventoryTable";
import InventoryTable from "../../components/molecules/InventoryTable";
import SummaryCards from "../../components/molecules/SummaryCards";

const Overview: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryProps[]>([]);
  const [dealers, setDealers] = useState<DealerProps[]>([]);
  const [openDrawer, setOpenDrawer] = useState<"inventory" | "dealer" | null>(
    null
  );

  useEffect(() => {
    const initialInventory = [
      { type: "Sedan", imported: 120, exported: 90, remaining: 30 },
      { type: "SUV", imported: 200, exported: 150, remaining: 50 },
      { type: "Truck", imported: 80, exported: 60, remaining: 20 },
    ] as unknown as InventoryProps[];
    setInventory(initialInventory);

    const inititalDealer = [
      { region: "Hà Nội", sales: 1200, debt: 300 },
      { region: "TP.HCM", sales: 1800, debt: 450 },
      { region: "Đà Nẵng", sales: 900, debt: 150 },
    ] as unknown as DealerProps[];
    setDealers(inititalDealer);
  }, []);

  const totalImported = inventory.reduce((a, b) => a + (b as any).imported, 0);
  const totalExported = inventory.reduce((a, b) => a + (b as any).exported, 0);
  const totalRemaining = inventory.reduce(
    (a, b) => a + (b as any).remaining,
    0
  );
  const totalDebt = dealers.reduce((a, b) => a + (b as any).debt, 0);

  return (
    <div style={{ padding: 24, background: "#f5f5f5" }}>
      <SectionTitle text="Tổng Quan Hãng Xe" />

      {/* Thẻ tổng quan */}
      <SummaryCards
        imported={totalImported}
        exported={totalExported}
        remaining={totalRemaining}
        debt={totalDebt}
      />

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        <Card
          className="rounded-2xl shadow-md"
          title="Nhập - Xuất - Tồn kho theo loại xe"
          extra={
            <Button
              type="link"
              className="text-blue-600"
              onClick={() => setOpenDrawer("inventory")}
            >
              Xem chi tiết
            </Button>
          }
        >
          <InventoryChart data={inventory} />
        </Card>

        <Card
          className="rounded-2xl shadow-md"
          title="Doanh số & Công nợ đại lý"
          extra={
            <Button
              type="link"
              className="text-green-600"
              onClick={() => setOpenDrawer("dealer")}
            >
              Xem chi tiết
            </Button>
          }
        >
          <DealerChart data={dealers} />
        </Card>
      </div>

      <Divider className="border-gray-300" />

      {/* Drawer hiển thị bảng */}
      <Drawer
        title={
          openDrawer === "inventory"
            ? "Chi tiết tồn kho xe"
            : "Chi tiết đại lý & doanh số"
        }
        placement="right"
        width={700}
        onClose={() => setOpenDrawer(null)}
        open={!!openDrawer}
      >
        {openDrawer === "inventory" && <InventoryTable data={inventory} />}
        {openDrawer === "dealer" && <Dealer data={dealers} />}
      </Drawer>
      {/* <SectionTitle text="Tổng Quan Hoạt Động Hãng Xe" />

      <SummaryCards
        imported={totalImported}
        exported={totalExported}
        remaining={totalRemaining}
        debt={totalDebt}
      />

      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InventoryTable data={inventory} />
        <Dealer data={dealers} />
      </div>

      <InventoryChart data={inventory} />
      <DealerChart data={dealers} />

      <Divider />
      {/* <Row gutter={16}>
        <Col span={12}>
          <InventoryTable data={inventory} />
        </Col>
        <Col span={12}>
          <Dealer data={dealers} />
        </Col>
      </Row> */}
    </div>
  );
};

export default Overview;
