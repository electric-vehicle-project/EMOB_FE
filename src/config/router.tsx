import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { LoginCard } from "../components/organisms/LoginCard"; 
import { ForgetPasswordCard } from "../components/organisms/ForgetPasswordCard";
import { OTPCard } from "../components/organisms/OPTCard";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";
import { DealerPage } from "../page/DealerPage"; // CRUD Dealer
import { ROUTES } from "../model/routePaths";
import AuthLayout from "../layout/AuthLayout";
import { TestDrivePage } from "../page/TestDrivePage";

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
        path: ROUTES.TESTDRIVE, // => /admin/testdrive
        element: <TestDrivePage />,
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
        element: <LoginCard />,
      },
      {
        path: ROUTES.FORGET_PASSWORD,
        element: <ForgetPasswordCard />,
      },
      {
        path: ROUTES.FORGET_PASSWORD_OTP,
        element: <OTPCard />,
      },
    ],
  },
  {
    path: ROUTES.NOTFOUND, // bắt tất cả path không khớp
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
