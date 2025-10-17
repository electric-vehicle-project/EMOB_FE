import { useState, useEffect } from "react";
import { Button, Tooltip } from "antd";
import { CiLogout } from "react-icons/ci";
import { Outlet, useNavigate } from "react-router-dom";
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
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logout } from "../redux/features/userSlice"; //action từ slice
import { useLogoutMutation } from "../service/authenticationService"; //hook API logout
import { ROUTES } from "../model/routePaths";


function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const { mutate: logoutMutation } = useLogoutMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const items = [
    getItem("Option 1", "/admin/dealers", <PieChartOutlined />),
    getItem("Option 2", "/option2", <DesktopOutlined />),
    getItem("User", "/admin/user", <UserOutlined />, [
      getItem("Tom", "/admin/test/test01"),
      getItem("Bill", "/user/bill"),
      getItem("Alex", "/user/alex"),
    ]),
    getItem("Team", "/team", <TeamOutlined />, [
      getItem("Team 1", "/team/1"),
      getItem("Team 2", "/team/2"),
    ]),
    getItem("Files", "/files", <FileOutlined />),
  ];

  const handleLogout = () => {
    const token = localStorage.getItem("token");

    logoutMutation(
      { token },
      {
        onSuccess: () => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            dispatch(logout());
            toast.success("Đăng xuất thành công!");
            navigate(ROUTES.HOME);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          console.error("Logout error:", error);
          toast.error("Lỗi kết nối server, vui lòng thử lại sau.");
        },
      }
    );
  };


  // Delay để chữ hiện/mất sau khi sidebar animation xong
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sidebarOpen) {
      timer = setTimeout(() => setShowLabels(true), 500);
    } else {
      setShowLabels(false);
    }
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  return (
    <section className="h-screen w-full flex relative">
      {/* Sidebar: same behavior on all breakpoints (push layout) */}
      <div
        className={`h-full bg-[var(--secondary-color)] sidebar-decor transition-[width] duration-500 ease-smooth flex flex-col items-center relative ${sidebarOpen ? "w-[250px]" : "w-[70px]"
          }`}
      >
        {/* Toggle button */}
        <div className="absolute top-4 left-4">
          <Button
            type="text"
            aria-label={sidebarOpen ? "Thu gọn" : "Mở rộng"}
            onClick={() => setSidebarOpen((v) => !v)}
            className="btn-press with-ripple"
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
        <div className="mt-16 mb-6 flex justify-center transition-all duration-500 ease-smooth">
          <div className="logo-glass p-2">
            <img
              src="/logo_1.png"
              alt="Logo"
              className={`transition-all duration-500 ease-smooth ${sidebarOpen ? "w-20 h-20" : "w-12 h-12"
                }`}
            />
          </div>
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
              onClick={handleLogout}
              className={`flex items-center justify-center rounded-xl cursor-pointer with-ripple ripple-dark btn-press hover-lift btn-glass-dark
        transition-all duration-500 ease-smooth
        ${sidebarOpen ? "!w-[90%] !h-12 px-4" : "!w-12 !h-12"}
      `}
            >
              {/* Icon */}
              <CiLogout
                size={sidebarOpen ? 22 : 32}
                className="text-white transition-all duration-500 ease-smooth"
              />

              {/* Label (fade-in sau khi sidebar mở xong) */}
              <span
                className={`ml-2 text-sm font-medium text-white whitespace-nowrap flex items-center menu-label-transition ${sidebarOpen
                  ? "opacity-100 translate-x-0 delay-[500ms]"
                  : "opacity-0 -translate-x-2 delay-0"
                  }`}
              >
                {sidebarOpen && "Đăng xuất"}
              </span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 bg-[var(--neutural-color)] transition-all duration-500 ease-smooth p-3 sm:p-6 overflow-x-auto">
        <Outlet />
      </div>
    </section>
  );
}

export default DashboardLayout; 