import { createBrowserRouter, type RouteObject } from "react-router-dom";
import TestPage from "../page/TestPage";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";

export const routes: RouteObject[] = [
  {
    path: "/admin",
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
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/*",
    element: <NotFoundPage />,
  },
];
export const router = createBrowserRouter(routes);
