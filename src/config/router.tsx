import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";
import { DealerPage } from "../page/DealerPage"; // CRUD Dealer
import { ROUTES } from "../model/routePaths";
import AuthLayout from "../layout/AuthLayout";

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
        path: ROUTES.DEALERS, // => /admin/dealers
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
    path: ROUTES.AUTH, // bắt tất cả path không khớp
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <h1>Login form,reset password form</h1>,
      },
    ],
  },
  {
    path: ROUTES.NOTFOUND, // bắt tất cả path không khớp
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
