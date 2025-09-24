import { Button, Col, Menu, Row } from "antd";
import React, { type ReactNode } from "react";
import { CiLogout } from "react-icons/ci";
import { Outlet } from "react-router-dom";
import { router, routes } from "../config/router";
import { createFlattenedRoutes } from "../utils/getChildrenPaths";
import { createMenuItems } from "../utils/menuUtils";

function DashboardLayout() {
  const flattenedData = createFlattenedRoutes(routes);
  console.log(flattenedData);
  const menuItems = createMenuItems(flattenedData);
  console.log(menuItems);

  return (
    <section className="h-screen w-full">
      <Row className="w-full h-full">
        <Col span={4} className="bg-[var(--secondary-color)] ">
          <div className="w-full h-full flex gap-4 items-center justify-start flex-col py-[15px]">
            <img src="/logo_1.png" alt="" />
            <div className="flex-1 w-full">
              <Menu
                style={{ backgroundColor: "var(--primary-color) !important" }}
                mode="vertical"
                items={menuItems}
              />
            </div>

            <Button
              color="primary"
              variant="solid"
              className="w-[80%] "
              size="large"
            >
              <span className="flex items-center gap-2">
                <CiLogout size={23} />
                Đăng xuất
              </span>
            </Button>
          </div>
        </Col>
        <Col span={20} className="bg-[var(--neutural-color)]">
          <Outlet />
        </Col>
      </Row>
    </section>
  );
}

export default DashboardLayout;
