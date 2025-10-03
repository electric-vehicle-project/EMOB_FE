import { useState, useEffect } from "react";
import { Button, Tooltip } from "antd";
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const items = [
    getItem("Option 1", "/option1", <PieChartOutlined />),
    getItem("Option 2", "/option2", <DesktopOutlined />),
    getItem("User", "/user", <UserOutlined />, [
      getItem("Tom", "/user/tom"),
      getItem("Bill", "/user/bill"),
      getItem("Alex", "/user/alex"),
    ]),
    getItem("Team", "/team", <TeamOutlined />, [
      getItem("Team 1", "/team/1"),
      getItem("Team 2", "/team/2"),
    ]),
    getItem("Files", "/files", <FileOutlined />),
  ];

  // Delay để chữ hiện/mất sau khi sidebar animation xong
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sidebarOpen) {
      timer = setTimeout(() => setShowLabels(true), 300); // hiện chữ trễ sau khi mở
    } else {
      setShowLabels(false); // ẩn chữ ngay khi đóng
    }
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  return (
    <section className="h-screen w-full flex">
      {/* Sidebar */}
      <div
        className={`h-full bg-[var(--secondary-color)] transition-[width] duration-500 ease-in-out flex flex-col items-center relative`}
        style={{ width: sidebarOpen ? "250px" : "70px" }}
      >
        {/* Toggle button */}
        <div className="absolute top-4 left-4">
          <Button
            type="text"
            aria-label={sidebarOpen ? "Thu gọn" : "Mở rộng"}
            onClick={() => setSidebarOpen((v) => !v)}
            className="transition-transform duration-300 ease-in-out"
            icon={
              sidebarOpen ? (
                <MenuFoldOutlined className="!text-2xl !text-white" />
              ) : (
                <MenuUnfoldOutlined className="!text-2xl !text-white" />
              )
            }
          />
        </div>

        {/* Logo */}
        <div className="mt-16 mb-6 flex justify-center transition-all duration-500 ease-in-out">
          <img
            src="/logo_1.png"
            alt="Logo"
            className={`transition-all duration-500 ease-in-out ${
              sidebarOpen ? "w-20 h-20" : "w-12 h-12"
            }`}
          />
        </div>

        {/* Menu */}
        <div className="flex-1 w-full px-2">
          <MenuDashboard
            items={items}
            collapsed={!sidebarOpen}
            showLabels={showLabels}
          />
        </div>

        {/* Logout */}
        <div className="p-3 flex justify-center w-full">
          <Tooltip title={!sidebarOpen ? "Đăng xuất" : ""} placement="right">
            <div
              className={`flex items-center justify-center rounded-xl cursor-pointer
        !bg-[var(--primary-color)] !text-green-100 hover:!bg-[#525e46]
        transition-all duration-500 ease-in-out
        ${sidebarOpen ? "!w-[90%] !h-12 px-4" : "!w-12 !h-12"}
      `}
            >
              {/* Icon */}
              <CiLogout
                size={sidebarOpen ? 22 : 32}
                className="text-white transition-all duration-500 ease-in-out"
              />

              {/* Label (fade-in sau khi sidebar mở xong) */}
              <span
                className={`ml-2 text-sm font-medium text-white whitespace-nowrap
          flex items-center
          transition-all ease-in-out
          ${
            sidebarOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2"
          }
        `}
                style={{
                  transitionDelay: sidebarOpen ? "500ms" : "0ms", // ⏳ chờ sidebar mở hết mới hiện
                  transitionDuration: "400ms",
                }}
              >
                {sidebarOpen && "Đăng xuất"}
              </span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[var(--neutural-color)] transition-all duration-500 ease-in-out p-6">
        <Outlet />
      </div>
    </section>
  );
}

export default DashboardLayout;
