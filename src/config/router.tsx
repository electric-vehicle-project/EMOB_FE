import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { LoginCard } from "../components/organisms/LoginCard";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";
import ReportPage from "../page/ReportPage";
import { DealerPage } from "../page/DealerPage";
import { ROUTES } from "../model/routePaths";
import AuthLayout from "../layout/AuthLayout";
import { CustomerPage } from "../page/CustomerPage";
import { CustomerDetailPage } from "../page/CustomerDetailPage";
import { TestDrivePage } from "../page/TestDrivePage";
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";
import DealerPromotionsPage from "../page/promotions/DealerPromotionsPage";
import PromotionCreatePage from "../page/promotions/PromotionCreatePage";
import PromotionEditPage from "../page/promotions/PromotionEditPage";
import EvmPromotionsPage from "../page/promotions/EvmPromotionsPage";

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },

  // ==== AUTH ====
  {
    path: ROUTES.AUTH, // /auth
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginCard /> }, // /auth/login
      // nếu sau này có register: { path: ROUTES.REGISTER, element: <RegisterPage /> },
    ],
  },

  // ==== ADMIN ====
  {
    path: ROUTES.ADMIN,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.DEALERS, element: <DealerPage /> },
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> },
      { path: "test", element: <TestPage /> },
    ],
  },

  // ==== DEALER STAFF ====
  {
    path: ROUTES.DEALER_STAFF,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
    ],
  },

  // ==== EVM STAFF ====
  {
    path: ROUTES.EVM_STAFF,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
    ],
  },

  // ==== DASHBOARD ====
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },
      { path: "test", element: <TestPage /> },
    ],
  },

  // ==== 404 ====
  {
    path: ROUTES.NOTFOUND,
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
