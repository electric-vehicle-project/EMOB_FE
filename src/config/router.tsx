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
import TestPage from "../page/TestPage";
import { CustomerPage } from "../page/customer/CustomerPage";
import CustomerDetailPage from "../page/customer/CustomerDetailPage";
import CreateQuotationPage from "../page/quotation/CreateQuotationModal";
import UpdateQuotationModal from "../page/quotation/UpdateQuotationModal";
import QuotationPage from "../page/quotation/QuotationPage";
import ViewQuotationDetailModal from "../page/quotation/ViewQuotationDetailModal";

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

  // DEALER_MANAGER + DEALER_STAFF
  {
    path: ROUTES.DASHBOARD,
    element: (
      <AuthProtect allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },
      { path: "test", element: <TestPage /> },
      { path: ROUTES.QUOTATION_CREATE, element: <CreateQuotationPage /> },
      {
        // path: `${ROUTES.QUOTATION_UPDATE}/:id`,
        path: `${ROUTES.QUOTATION_UPDATE}`,
        element: <UpdateQuotationModal />,
      },
      { path: ROUTES.QUOTATIONS, element: <QuotationPage /> },
      { path: ROUTES.QUOTATION_VIEW, element: <ViewQuotationDetailModal /> },
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
