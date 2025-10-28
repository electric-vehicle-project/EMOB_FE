import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";
import { ROUTES } from "../model/routePaths";

// 🔐 Auth Pages
import { LoginCard } from "../components/organisms/LoginCard";
import { ForgetPasswordCard } from "../components/organisms/ForgetPasswordCard";
import { OTPCard } from "../components/organisms/OTPCard";
import { ResetPasswordCard } from "../components/organisms/ResetPasswordCard";

// 📄 General
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import ReportPage from "../page/ReportPage";

// ===== DEALER PAGES =====
import { DealerPage } from "../page/DealerPage";
import { TestDrivePage } from "../page/TestDrivePage";

// 👤 Profile
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";
import { CustomerPage } from "../page/customer/CustomerPage";
import CustomerDetailPage from "../page/customer/CustomerDetailPage";

// ⚡ EV Management
import { VehiclePage } from "../page/EVM/VehiclePage";
import { VehicleBulkPage } from "../page/EVM/VehicleBulkPage";
import { VehicleDetailPage } from "../page/EVM/VehicleDetailPage";
import { VehicleEditPage } from "../page/EVM/VehicleEditPage";
import { VehiclePriceUpdatePage } from "../page/EVM/VehiclePriceUpdatePage";
import { VehicleCreatePage } from "../page/EVM/VehicleCreatePage";
import { VehiclePriceRulePage } from "../page/EVM/VehiclePriceRulePage";
import { AuthProtect } from "../components/atoms/AuthProtect";

import { CustomerCreatePage } from "../page/customer/CustomerCreatePage";
import { CustomerEditPage } from "../page/customer/CustomerEditPage";
import { DealerPointRulePage } from "../page/customer/DealerPointRulePage";
import EvmPromotionsPage from "../page/promotions/EvmPromotionsPage";
import PromotionEditPage from "../page/promotions/PromotionEditPage";
import PromotionCreatePage from "../page/promotions/PromotionCreatePage";
import { SaleOrderDealerPage } from "../page/saleOrder/SaleOrderDealerPage";
import { SaleOrderDetailPage } from "../page/saleOrder/SaleOrderDetailPage";
import { DealerPromotionsPage } from "../page/promotions/DealerPromotionsPage";

export const router = createBrowserRouter([
  // 🏠 Trang chủ
  { path: ROUTES.HOME, element: <HomePage /> },
  // 🔐 AUTH
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
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
    ],
  },

  // ⚡ EVM DASHBOARD
  {
    path: ROUTES.DASHBOARD,
    element: (
      <AuthProtect allowedRoles={["MANAGER", "DEALER_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      // 👤 Profile
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },

      // ⚡ Vehicle Management
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      {
        path: ROUTES.EVM_VEHICLE_PRICE_UPDATE,
        element: <VehiclePriceUpdatePage />,
      },

      // ✅ Price Rules
      { path: ROUTES.EVM_VEHICLE_RULES, element: <VehiclePriceRulePage /> },

      // 👥 Customer Detail
      { path: `${ROUTES.CUSTOMERS}/:id`, element: <CustomerDetailPage /> },
    ],
  },

  // ==== MANAGER ====
  {
    path: ROUTES.MANAGER, // /manager
    element: (
      <AuthProtect allowedRoles={["MANAGER"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> },
      { path: ROUTES.DEALER_POINT_RULES, element: <DealerPointRulePage /> },
      { path: ROUTES.SALE_ORDERS, element: <SaleOrderDealerPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
    ],
  },

  // ==== DEALER STAFF ====
  {
    path: ROUTES.DEALER_STAFF,
    element: (
      <AuthProtect allowedRoles={["DEALER_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> },
      { path: ROUTES.CUSTOMER_CREATE, element: <CustomerCreatePage /> },
      { path: ROUTES.CUSTOMER_EDIT, element: <CustomerEditPage /> },
      { path: ROUTES.DEALER_POINT_RULES, element: <DealerPointRulePage /> },
      { path: ROUTES.SALE_ORDERS, element: <SaleOrderDealerPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
    ],
  },

  // ==== EVM STAFF ====
  {
    path: ROUTES.EVM_STAFF,
    element: (
      <AuthProtect allowedRoles={["EVM_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
    ],
  },

  // ==== 404 ====
  {
    path: ROUTES.NOTFOUND, // *
    element: <NotFoundPage />,
  },
]);
