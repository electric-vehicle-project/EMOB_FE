import React from "react";
import { Link } from "react-router-dom";
export type MenuItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

export interface FlattenedRoute {
  fullPath: string;
  children: string;
}

// Hàm factory tạo MenuItem
function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label: <Link to={key}>{label}</Link>,
  };
}

const capitalizeFirstLetter = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const createMenuItems = (
  flattenedRoutes: FlattenedRoute[]
): MenuItem[] => {
  const menuTree: Record<string, any> = {};

  // Build tree từ flattened routes
  flattenedRoutes.forEach((route) => {
    const segments = route.fullPath.split("/").filter(Boolean).slice(1); // bỏ qua 'admin'
    const leafLabel = route.children;
    const leafKey = `${
      route.fullPath.endsWith("/") ? route.fullPath : route.fullPath + "/"
    }${leafLabel}`;

    let currentNode = menuTree;
    segments.forEach((seg) => {
      if (!currentNode[seg]) currentNode[seg] = {};
      if (typeof currentNode[seg] === "string") currentNode[seg] = {};
      currentNode = currentNode[seg];
    });

    currentNode[leafLabel] = leafKey; // gán leaf
  });

  // Đệ quy build MenuItem[]
  const buildMenu = (node: Record<string, any>): MenuItem[] => {
    return Object.entries(node)
      .map(([key, value]) => {
        const label = capitalizeFirstLetter(key);
        if (typeof value === "string") {
          return getItem(label, value);
        }
        if (typeof value === "object" && Object.keys(value).length > 0) {
          return getItem(label, `/${key}`, undefined, buildMenu(value));
        }
        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  return buildMenu(menuTree);
};
