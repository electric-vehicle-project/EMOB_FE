import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";
import { DealerPage } from "../page/DealerPage"; // CRUD Dealer
import { ROUTES } from "../model/routePaths";

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
        path: "dealers", // => /admin/dealers
        element: <DealerPage />,
      },
      {
        path: "test", // => /admin/test
        element: <TestPage />,
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
