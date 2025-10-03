import { Button, Col, Row } from "antd";
import { CiLogout } from "react-icons/ci";
import { Outlet } from "react-router-dom";
import { getItem } from "../utils/menuUtils";
import MenuDashboard from "../components/atoms/MenuDashboard";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
function DashboardLayout() {
  const items = [
    getItem("Option 1", "1", <PieChartOutlined />),
    getItem("Option 2", "2", <DesktopOutlined />),
    getItem("User", "sub1", <UserOutlined />, [
      getItem("Tom", "3"),
      getItem("Bill", "4"),
      getItem("Alex", "5"),
    ]),
    getItem("Team", "sub2", <TeamOutlined />, [
      getItem("Team 1", "6"),
      getItem("Team 2", "8"),
    ]),
    getItem("Files", "9", <FileOutlined />),
  ];

  return (
    <section className="h-screen w-full">
      <Row className="w-full h-full">
        <Col span={4} className="bg-[var(--secondary-color)] ">
          <div className="w-full h-full flex gap-10 items-center justify-start flex-col py-[15px]">
            <img src="/logo_1.png" alt="" />
            <div className="flex-1 w-full px-7">
              <MenuDashboard items={items} />
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
