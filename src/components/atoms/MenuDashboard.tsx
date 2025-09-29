import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import type { MenuItem } from "../../utils/menuUtils";

function MenuDashboard({ items }: { items: MenuItem[] }) {
  console.log(items);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location = useLocation();
  // Lấy phần key từ / thứ 2 trở đi
  const getComparePath = (key: string) => {
    const parts = key.split("/").filter(Boolean); // Bỏ empty strings
    return parts.length > 1 ? `/${parts.slice(1).join("/")}` : key;
  };

  const currentPath = getComparePath(location.pathname);
  console.log(currentPath);
  // Kiểm tra xem menu item có active không
  const normalizePath = (path?: string) => {
    if (!path) return "";
    return path.replace(/^\/+|\/+$/g, ""); // bỏ hết / đầu và cuối
  };

  const isActive = (item: MenuItem) => {
    const current = normalizePath(currentPath);

    // Kiểm tra key trực tiếp
    if (item.key && normalizePath(item.key) === current) return true;

    // Kiểm tra children
    if (item.children) {
      return item.children.some(
        (child) => child.key && normalizePath(child.key) === current
      );
    }

    return false;
  };

  return (
    <>
      {/* Menu chính */}

      {items.map((item, index) => (
        <div key={item.key} className="relative mb-2 group">
          <button
            onMouseEnter={() => setActiveMenu(item.key)}
            className={`w-full  rounded-lg text-left transition-all duration-200 ${
              isActive(item)
                ? "bg-[var(--default-color)] text-white shadow-lg"
                : "bg-[var(--primary-color)] text-green-100 hover:bg-[#525e46]"
            }`}
          >
            {!item.children ? (
              <Link
                to={item.key}
                className="flex items-center gap-2 px-4 py-4 w-full"
              >
                <span className="text-[20px] text-white">{item.icon}</span>
                <span className="text-sm text-white font-medium">
                  {item.label}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-4 py-4 w-full">
                <span className="text-[20px] text-white">{item.icon}</span>
                <span className="text-sm text-white font-medium">
                  {item.label}
                </span>
              </div>
            )}
          </button>

          {item.children && activeMenu === item.key && (
            <div
              className="absolute left-full top-0 ml-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
              onMouseEnter={() => setActiveMenu(item.key)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              {item.children.map((child, idx) => (
                <div
                  key={child.key}
                  className={`w-full flex items-center gap-3 text-left transition-colors ${
                    idx !== item.children.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  } ${
                    child.key && child.key === location.pathname
                      ? "bg-[var(--default-color)] "
                      : "hover:bg-[#dceccb] text-gray-700 hover:text-green-800"
                  }`}
                >
                  <Link
                    to={child.key || "#"}
                    className="flex items-center gap-2 px-4 py-3 w-full"
                  >
                    <span
                      className={`text-[20px] ${
                        child.key && child.key === location.pathname
                          ? " text-white"
                          : "text-[var(--default-color)]"
                      }`}
                    >
                      {child.icon}
                    </span>
                    <span
                      className={`text-sm ${
                        child.key && child.key === location.pathname
                          ? " text-white"
                          : "text-[var(--default-color)]"
                      } font-medium`}
                    >
                      {child.label}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default MenuDashboard;
