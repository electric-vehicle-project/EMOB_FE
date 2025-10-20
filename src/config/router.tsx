// src/router/router.tsx
import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";

// 🔐 Auth
import { LoginCard } from "../components/organisms/LoginCard";
import { ForgetPasswordCard } from "../components/organisms/ForgetPasswordCard";
import { OTPCard } from "../components/organisms/OPTCard";
import { ResetPasswordCard } from "../components/organisms/ResetPasswordCard";

// 📄 General
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import ReportPage from "../page/ReportPage";
import { DealerPage } from "../page/DealerPage";
import { CustomerPage } from "../page/CustomerPage";
import { CustomerDetailPage } from "../page/CustomerDetailPage";
import { TestDrivePage } from "../page/TestDrivePage";

// 👤 Profile
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";

// ⚡ EV Management
import { VehiclePage } from "../page/EVM/VehiclePage";
import { VehicleBulkPage } from "../page/EVM/VehicleBulkPage";
import { VehicleDetailPage } from "../page/EVM/VehicleDetailPage";
import { VehicleEditPage } from "../page/EVM/VehicleEditPage";
import { VehiclePriceUpdatePage } from "../page/EVM/VehiclePriceUpdatePage";
import { VehicleCreatePage } from "../page/EVM/VehicleCreatePage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },

  // AUTH
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginCard /> },
      { path: "forget-password", element: <ForgetPasswordCard /> },
      { path: "forget-password-otp", element: <OTPCard /> },
      { path: "reset-password", element: <ResetPasswordCard /> },
    ],
  },

  // ADMIN
  {
    path: "admin",
    element: <DashboardLayout />,
    children: [
      { path: "dealers", element: <DealerPage /> },
      { path: "customers", element: <CustomerPage /> },
      { path: "testdrive", element: <TestDrivePage /> },
      { path: "report", element: <ReportPage /> },
    ],
  },

  // DASHBOARD
  {
    path: "dashboard",
    element: <DashboardLayout />,
    children: [
      // Profile
      { path: "profile/info", element: <InfoPage /> },
      { path: "profile/changeInfo", element: <ChangeInfoPage /> },
      { path: "profile/resetpassword", element: <ResetPasswordPage /> },
      { path: "profile/viewSchedule", element: <ViewSchedulePage /> },

      // Vehicle Management
      { path: "evm/vehicle", element: <VehiclePage /> },
      { path: "evm/vehicle/bulk", element: <VehicleBulkPage /> },
      { path: "evm/vehicle/new", element: <VehicleCreatePage /> },
      { path: "evm/vehicle/:id", element: <VehicleDetailPage /> },
      { path: "evm/vehicle/edit/:id", element: <VehicleEditPage /> },
      { path: "evm/vehicle/prices/:id", element: <VehiclePriceUpdatePage /> },

      // Customer detail
      { path: "customers/:id", element: <CustomerDetailPage /> },
    ],
  },

  // 404
  { path: "*", element: <NotFoundPage /> },
]);
