import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip } from "antd";
import type { MenuItem } from "../../utils/menuUtils";

type Props = { items: MenuItem[]; collapsed?: boolean; showLabels?: boolean };

const normalize = (p?: string) => (p ? p.replace(/^\/+|\/+$/g, "") : "");

function MenuDashboard({ items, collapsed, showLabels }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const location = useLocation();
  const current = normalize(location.pathname);
  const isActive = (item: MenuItem) => {
    if (item.key && normalize(item.key) === current) return true;
    if (item.children?.length) {
      return item.children.some((c) => c.key && normalize(c.key) === current);
    }
    return false;
  };

  return (
    <>
      {items.map((item, index) => {
        const active = isActive(item);

        // Nút chính
        const BaseBtn = (
          <div
            onMouseEnter={() => setActiveKey(item.key || null)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
              transition-all duration-500 ease-in-out
              ${
                active
                  ? "!bg-[var(--default-color)] text-white shadow-md"
                  : "!bg-[var(--primary-color)] !text-green-100 hover:!bg-[#525e46]"
              }`}
            style={{
              transitionDelay: `${index * 80}ms`, // stagger animation
            }}
          >
            {/* Icon */}
            <span className="text-[20px] text-white">{item.icon}</span>

            {/* Label (fade + scale) */}
            <span
              className={`text-sm font-medium text-white transform origin-left
                transition-all duration-500 ease-in-out
                ${
                  !collapsed && showLabels
                    ? "opacity-100 scale-x-100 w-auto"
                    : "opacity-0 scale-x-0 w-0"
                }`}
              style={{
                transitionDelay:
                  !collapsed && showLabels ? `${150 + index * 80}ms` : "0ms",
              }}
            >
              {item.label}
            </span>
          </div>
        );

        return (
          <div key={item.key} className="relative mb-2">
            {/* Tooltip khi thu gọn */}
            {collapsed ? (
              <Tooltip title={item.label} placement="right">
                <Link to={item.key || "#"}>{BaseBtn}</Link>
              </Tooltip>
            ) : (
              <Link to={item.key || "#"}>{BaseBtn}</Link>
            )}

            {/* Submenu (fade + slide mượt) */}
            {item.children?.length && (
              <div
                className={`absolute left-full top-0 ml-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 z-[1200] overflow-hidden
                  transition-all duration-500 ease-in-out transform
                  ${
                    activeKey === item.key
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
                onMouseEnter={() => setActiveKey(item.key || null)}
                onMouseLeave={() => setActiveKey(null)}
              >
                {item.children.map((child, idx) => {
                  const childActive =
                    child.key && normalize(child.key) === current;
                  return (
                    <Link
                      key={child.key || idx}
                      to={child.key || "#"}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors duration-300
                        ${
                          childActive
                            ? "bg-[var(--default-color)] text-white"
                            : "hover:!bg-[#dceccb] text-[var(--default-color)]"
                        }`}
                      style={{ transitionDelay: `${idx * 60}ms` }}
                    >
                      <span className="text-[18px]">{child.icon}</span>
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default MenuDashboard;
