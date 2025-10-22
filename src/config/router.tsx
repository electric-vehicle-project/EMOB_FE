import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";
import { ROUTES } from "../model/routePaths";
import { AuthProtect } from "../components/atoms/AuthProtect";

import { LoginCard } from "../components/organisms/LoginCard";
import { ForgetPasswordCard } from "../components/organisms/ForgetPasswordCard";
import { OTPCard } from "../components/organisms/OTPCard";
import { ResetPasswordCard } from "../components/organisms/ResetPasswordCard";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import ReportPage from "../page/ReportPage";

// ===== DEALER PAGES =====
import { DealerPage } from "../page/DealerPage";
import { TestDrivePage } from "../page/TestDrivePage";

// ===== PROFILE PAGES =====
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";

import { CustomerPage } from "../page/customer/CustomerPage";
import CustomerDetailPage from "../page/customer/CustomerDetailPage";
import DealerPromotionsPage from "../page/promotions/DealerPromotionsPage";
import PromotionCreatePage from "../page/promotions/PromotionCreatePage";
import PromotionEditPage from "../page/promotions/PromotionEditPage";
import { CustomerCreatePage } from "../page/customer/CustomerCreatePage";
import { CustomerEditPage } from "../page/customer/CustomerEditPage";

export const routes: RouteObject[] = [
  { path: ROUTES.HOME, element: <HomePage /> },

  // Auth layout cho login / reset password
  {
    path: ROUTES.AUTH,
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginCard /> },
      { path: ROUTES.FORGET_PASSWORD, element: <ForgetPasswordCard /> },
      { path: ROUTES.FORGET_PASSWORD_OTP, element: <OTPCard /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordCard /> },
    ],
  },

  // ADMIN
  {
    path: ROUTES.ADMIN,
    element: (
      <AuthProtect allowedRoles={["ADMIN"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.DEALERS, element: <DealerPage /> },
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: `${ROUTES.CUSTOMERS}/:id`, element: <CustomerDetailPage /> },
    ],
  },

  // EVM_STAFF
  {
    path: ROUTES.EVM_STAFF,
    element: (
      <AuthProtect allowedRoles={["EVM_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.DEALERS, element: <DealerPage /> },
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: `${ROUTES.CUSTOMERS}/:id`, element: <CustomerDetailPage /> },
    ],
  },

  // MANAGER + DEALER_STAFF
  {
    path: ROUTES.DASHBOARD,
    element: (
      <AuthProtect allowedRoles={["MANAGER", "DEALER_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },
    ],
  },

  // MANAGER
  {
    path: ROUTES.MANAGER, // /manager
    element: (
      <AuthProtect allowedRoles={["MANAGER"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> }, // /manager/promotions
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> }, // /manager/promotions/create
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> }, // /manager/promotions/edit/:id
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> }, // /manager/customers
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> }, // /manager/customers/:id
    ],
  },

  // DEALER STAFF
  {
    path: ROUTES.DEALER_STAFF, // /dealer-staff
    element: (
      <AuthProtect allowedRoles={["DEALER_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> }, // /dealer-staff/promotions
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> }, // /dealer-staff/promotions/create
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> }, // /dealer-staff/promotions/edit/:id
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> }, // /dealer-staff/customers
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> }, // /dealer-staff/customers/:id
      { path: ROUTES.CUSTOMER_CREATE, element: <CustomerCreatePage /> }, // /dealer-staff/customers/create
      { path: ROUTES.CUSTOMER_EDIT, element: <CustomerEditPage /> }, // /dealer-staff/customers/create
    ],
  },

  // // CUSTOMER
  // {
  //   path: "/customer",
  //   element: (
  //     <AuthProtect allowedRoles={["CUSTOMER"]}>
  //       <DashboardLayout />
  //     </AuthProtect>
  //   ),
  //   children: [
  //     { path: "profile/info", element: <InfoPage /> },
  //     { path: "profile/changeInfo", element: <ChangeInfoPage /> },
  //     { path: "profile/resetPassword", element: <ResetPasswordPage /> },
  //   ],
  // },

  //404
  { path: ROUTES.NOTFOUND, element: <NotFoundPage /> },
];

//       EXPORT ROUTER
export const router = createBrowserRouter(routes);
