import { memo, useState } from "react";
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
    <div className="menu-stagger">
      {items.map((item, index) => {
        const active = isActive(item);
        const hasChildren = item.children?.length;

        const BaseBtn = (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer btn-press with-ripple hover-lift smooth-transform
              transition-all duration-500 ease-smooth
              ${
                active
                  ? "!bg-[var(--default-color)] text-white shadow-md"
                  : "btn-glass-dark ripple-dark !text-white"
              }`}
          >
            <span className="text-[20px] text-white">{item.icon}</span>

            {/* Label */}
            <span
              className={`menu-label-box text-sm font-medium text-white transform origin-left menu-label-transition
                ${
                  !collapsed && showLabels
                    ? "opacity-100 scale-x-100"
                    : "opacity-0 scale-x-0"
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

        // Wrapper dựa vào có children hay không
        const ButtonWrapper = hasChildren ? (
          collapsed ? (
            <Tooltip title={item.label} placement="right">
              {BaseBtn}
            </Tooltip>
          ) : (
            BaseBtn
          )
        ) : collapsed ? (
          <Tooltip title={item.label} placement="right">
            <Link to={item.key || "#"}>{BaseBtn}</Link>
          </Tooltip>
        ) : (
          <Link to={item.key || "#"}>{BaseBtn}</Link>
        );

        return (
          <div
            key={item.key}
            className="group relative mb-2"
            onMouseEnter={() => hasChildren && setActiveKey(item.key || null)}
            onMouseLeave={() => setActiveKey(null)}
          >
            {ButtonWrapper}

            {/* Submenu */}
            {item.children?.length && (
              <div
                className={`absolute left-full top-0 ml-2 w-60 rounded-xl shadow-xl z-[1200] overflow-hidden
                  bg-[rgba(0,0,0,0.38)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[4px]
                  transition-all duration-500 ease-in-out transform
                  ${
                    activeKey === item.key
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
              >
                {item.children!.map((child, idx) => {
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
                            : "hover:bg-[rgba(255,255,255,0.1)] text-white"
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
    </div>
  );
}

export default memo(MenuDashboard);
