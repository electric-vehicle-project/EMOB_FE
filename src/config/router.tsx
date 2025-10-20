import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";

// ===== AUTH PAGES =====
import { LoginCard } from "../components/organisms/LoginCard";

// ===== COMMON PAGES =====
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";
import ReportPage from "../page/ReportPage";

// ===== DEALER PAGES =====
import { DealerPage } from "../page/DealerPage";
import { CustomerPage } from "../page/CustomerPage";
import { CustomerDetailPage } from "../page/CustomerDetailPage";
import { TestDrivePage } from "../page/TestDrivePage";

// ===== PROFILE PAGES =====
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";

// ===== PROMOTION PAGES =====
import DealerPromotionsPage from "../page/promotions/DealerPromotionsPage";
import PromotionCreatePage from "../page/promotions/PromotionCreatePage";
import PromotionEditPage from "../page/promotions/PromotionEditPage";
import EvmPromotionsPage from "../page/promotions/EvmPromotionsPage";

// ===== ROUTES =====
import { ROUTES } from "../model/routePaths";

//       ROUTER SETUP
export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME, // /
    element: <HomePage />,
  },

  // ==== AUTH ====
  {
    path: ROUTES.AUTH, // /auth
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginCard />,
      },
      // {
      //   path: ROUTES.FORGET_PASSWORD,
      //   element: <ForgetPasswordCard />,
      // },
      // {
      //   path: ROUTES.FORGET_PASSWORD_OTP,
      //   element: <OTPCard/>,
      // },
      // {
      //   path: ROUTES.RESET_PASSWORD,
      //   element: <ResetPasswordCard />,
      // },
    ],
  },

  // ==== ADMIN ====
  {
    path: ROUTES.ADMIN, // /admin
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.DEALERS, element: <DealerPage /> }, // /admin/dealers
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> }, // /admin/testdrive
      { path: ROUTES.REPORT, element: <ReportPage /> }, // /admin/report
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> }, // /admin/customers
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> }, // /admin/customers/:id
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> }, // /admin/promotions
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> }, // /admin /promotions/edit/:id
      { path: "test", element: <TestPage /> }, // /admin/test
    ],
  },

  // ==== MANAGER ====
  {
    path: ROUTES.MANAGER, // /manager
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> }, // /manager/promotions
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> }, // /manager/promotions/create
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> }, // /manager/promotions/edit/:id
    ],
  },

  // ==== DEALER STAFF ====
  {
    path: ROUTES.DEALER_STAFF, // /dealer-staff
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> }, // /dealer-staff/promotions
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> }, // /dealer-staff/promotions/create
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> }, // /dealer-staff/promotions/edit/:id
    ],
  },

  // ==== EVM STAFF ====
  {
    path: ROUTES.EVM_STAFF, // /evm-staff
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> }, // /evm-staff/promotions
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> }, // /evm-staff/promotions/create
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> }, // /evm-staff/promotions/edit/:id
    ],
  },

  // ==== DASHBOARD (PROFILE) ====
  {
    path: ROUTES.DASHBOARD, // /dashboard
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> }, // /dashboard/profile/info
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> }, // /dashboard/profile/changeInfo
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> }, // /dashboard/profile/resetpassword
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> }, // /dashboard/profile/viewschedule
      { path: "test", element: <TestPage /> }, // /dashboard/test
    ],
  },

  // ==== 404 ====
  {
    path: ROUTES.NOTFOUND, // *
    element: <NotFoundPage />,
  },
];

//       EXPORT ROUTER
export const router = createBrowserRouter(routes);
