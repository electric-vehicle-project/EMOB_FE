import { createBrowserRouter, type RouteObject } from "react-router-dom";
import TestPage from "../page/TestPage";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import { ROUTES } from "../model/routePaths";

export const routes: RouteObject[] = [
  {
    path: ROUTES.ADMIN,
    element: <DashboardLayout />,
    children: [
      {
        path: "1",
        element: <TestPage />,
        children: [
          {
            path: "test01",
            element: <TestPage />,
          },
        ],
      },
      {
        path: "test02",
        element: <TestPage />,
      },

    ],
  },
  {
    path:ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.NOTFOUND,
    element: <NotFoundPage />,
  },
];
export const router = createBrowserRouter(routes);
