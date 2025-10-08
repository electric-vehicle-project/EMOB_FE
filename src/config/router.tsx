import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";
import { ROUTES } from "../model/routePaths";
import ReportPage from "../page/ReportPage";

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.ADMIN,
    element: <DashboardLayout />,
    children: [
      {
        path: ROUTES.REPORT, // => /admin/report
        element: <ReportPage />,
      },
      {
        path: "test/test01", // => /admin/test/test01
        element: <TestPage />,
      },
    ],
  },
  {
    path: ROUTES.NOTFOUND, // bắt tất cả path không khớp
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
