/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

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
export function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
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
    // Bỏ phần đầu (admin hoặc staff) để build tree
    const segments = route.fullPath.split("/").filter(Boolean).slice(1);
    const leafLabel = route.children;

    // Key = URL đầy đủ
    const leafKey = route.fullPath;

    let currentNode = menuTree;
    segments.forEach((seg) => {
      if (!currentNode[seg]) currentNode[seg] = {};
      if (typeof currentNode[seg] === "string") currentNode[seg] = {};
      currentNode = currentNode[seg];
    });

    currentNode[leafLabel] = leafKey; // gán leaf với URL gốc
  });

  // Đệ quy build MenuItem[]
  const buildMenu = (node: Record<string, any>): MenuItem[] => {
    return Object.entries(node)
      .map(([key, value]) => {
        const label = capitalizeFirstLetter(key);
        if (typeof value === "string") {
          // Leaf node: dùng URL làm key
          return getItem(label, value);
        }
        if (typeof value === "object" && Object.keys(value).length > 0) {
          // Parent node: dùng key hiện tại
          return getItem(label, `/${key}`, undefined, buildMenu(value));
        }
        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  return buildMenu(menuTree);
};
