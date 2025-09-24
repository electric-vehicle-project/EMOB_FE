import {
  createBrowserRouter,
  Outlet,
  type RouteObject,
} from "react-router-dom";
import TestPage from "../page/TestPage";
import DashboardLayout from "../layout/DashboardLayout";

export const routes: RouteObject[] = [
  {
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      {
        path: "test",
        element: <TestPage />,
        children: [
          {
            path: "test01",
            element: <TestPage />,
          },
          {
            path: "test02",
            element: <TestPage />,
          },
          {
            path: "test03",
            element: <TestPage />,
          },
          {
            path: "test04",
            element: <TestPage />,
          },
        ],
      },
      {
        path: "test2",
        element: <TestPage />,
      },
      {
        path: "test3",
        element: <TestPage />,
      },
      {
        path: "test4",
        element: <TestPage />,
      },
    ],
  },
  {
    path: "/*",
    element: <h1>Not Found</h1>,
  },
  {
    path: "/",
    element: <h1>Home</h1>,
  },
];
export const router = createBrowserRouter(routes);
