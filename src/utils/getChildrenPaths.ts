// utils.ts
import type { RouteObject } from "react-router-dom";

/**
 * Định nghĩa cấu trúc cho đối tượng đầu ra.
 */
export interface FlattenedRoute {
  fullPath: string;
  children: string; // Tên của route con cuối cùng
}

/**
 * [Hàm nội bộ - Helper]
 * Hàm đệ quy này xử lý các mảng route lồng nhau.
 * @param nestedRoutes - Mảng các route con cần xử lý.
 * @param parentPath - Đường dẫn đã được tích lũy từ route cha.
 * @returns Một mảng các route đã được làm phẳng.
 */
const processRoutesRecursively = (
  nestedRoutes: RouteObject[],
  parentPath: string
): FlattenedRoute[] => {
  const result: FlattenedRoute[] = [];

  nestedRoutes.forEach((route) => {
    // Nối path của route hiện tại vào path của cha để tạo đường dẫn đầy đủ
    const currentFullPath = `${parentPath}/${route.path || ''}`.replace(/\/+/g, '/');

    if (route.children && route.children.length > 0) {
      // Nếu vẫn còn route con, tiếp tục đi sâu hơn (đệ quy)
      result.push(...processRoutesRecursively(route.children, currentFullPath));
    } else if (route.path) {
      // Nếu đây là route cuối cùng (lá), thêm nó vào kết quả
      result.push({
        // fullPath là đường dẫn của thư mục cha chứa nó
        fullPath: `${parentPath}/`.replace(/\/+/g, '/'),
        children: route.path,
      });
    }
  });

  return result;
};

/**
 * Biến đổi toàn bộ cấu hình routes của ứng dụng thành một danh sách phẳng
 * để sử dụng cho mục đích điều hướng (navigation), menu, v.v.
 *
 * @param allRoutes - Mảng RouteObject cấp cao nhất của ứng dụng.
 * @returns Một mảng duy nhất chứa tất cả các route con đã được làm phẳng.
 */
export const createFlattenedRoutes = (allRoutes: RouteObject[]): FlattenedRoute[] => {
  let flattenedList: FlattenedRoute[] = [];

  // Lặp qua các route ở cấp cao nhất (ví dụ: /admin, /dashboard)
  allRoutes.forEach(topLevelRoute => {
    if (topLevelRoute.children) {
      const parentPath = topLevelRoute.path || '';
      // Bắt đầu quá trình đệ quy cho các con của route cấp cao nhất
      flattenedList.push(...processRoutesRecursively(topLevelRoute.children, parentPath));
    }
  });

  return flattenedList;
};