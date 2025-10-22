// src/config/router.tsx
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";
import { ROUTES } from "../model/routePaths";

// 🔐 Auth
import { AuthProtect } from "../components/atoms/AuthProtect";
import { LoginCard } from "../components/organisms/LoginCard";
import { ForgetPasswordCard } from "../components/organisms/ForgetPasswordCard";
import { OTPCard } from "../components/organisms/OTPCard";
import { ResetPasswordCard } from "../components/organisms/ResetPasswordCard";

// 📄 General
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import ReportPage from "../page/ReportPage";

// ===== ADMIN MODULES =====
import { DealerPage } from "../page/DealerPage";
import { TestDrivePage } from "../page/TestDrivePage";
import { AccountPage } from "../page/account/AccountPage";
import { AccountDetailPage } from "../page/account/AccountDetailPage";

// ===== PROFILE =====
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";

// ⚡ EVM MODULES
import { VehiclePage } from "../page/EVM/VehiclePage";
import { VehicleBulkPage } from "../page/EVM/VehicleBulkPage";
import { VehicleDetailPage } from "../page/EVM/VehicleDetailPage";
import { VehicleEditPage } from "../page/EVM/VehicleEditPage";
import { VehicleCreatePage } from "../page/EVM/VehicleCreatePage";
import { VehiclePriceRulePage } from "../page/EVM/VehiclePriceRulePage";
import { CustomerPage } from "../page/customer/CustomerPage";
import CustomerDetailPage from "../page/customer/CustomerDetailPage";

export const routes: RouteObject[] = [
  { path: ROUTES.HOME, element: <HomePage /> },

  // 🔐 AUTH LAYOUT
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

  // 👑 ADMIN DASHBOARD
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
      // 🧩 Account module (Admin quản lý Manager & EVM Staff)
      { path: ROUTES.ACCOUNTS, element: <AccountPage /> },
      { path: ROUTES.ACCOUNT_DETAIL, element: <AccountDetailPage /> },
      // Customers
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: `${ROUTES.CUSTOMERS}/:id`, element: <CustomerDetailPage /> },
    ],
  },

  // 👔 MANAGER DASHBOARD
  {
    path: ROUTES.MANAGER,
    element: (
      <AuthProtect allowedRoles={["MANAGER"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      // 🧩 Account module (Manager quản lý Dealer Staff)
      { path: ROUTES.ACCOUNTS, element: <AccountPage /> },
      { path: ROUTES.ACCOUNT_DETAIL, element: <AccountDetailPage /> },
      // General modules
      { path: ROUTES.DEALERS, element: <DealerPage /> },
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
    ],
  },

  // ⚡ EVM_STAFF DASHBOARD
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

  // 🏢 DEALER_MANAGER + DEALER_STAFF
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
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      { path: ROUTES.EVM_VEHICLE_RULES, element: <VehiclePriceRulePage /> },
    ],
  },

  // 🚫 404
  { path: ROUTES.NOTFOUND, element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
