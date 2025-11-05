// src/router.tsx
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

// ===== DEALER PAGES =====
import { DealerPage } from "../page/DealerPage";
import { TestDrivePage } from "../page/TestDrivePage";

// 👤 Profile
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";
import CustomerDetailPage from "../page/customer/CustomerDetailPage";

// ⚡ EV Management
import { VehicleListPage } from "../page/EVM/VehicleListPage";
import { VehicleBulkPage } from "../page/EVM/VehicleBulkPage";
import { VehicleDetailPage } from "../page/EVM/VehicleDetailPage";
import { VehicleEditPage } from "../page/EVM/VehicleEditPage";
import { VehiclePriceUpdatePage } from "../page/EVM/VehiclePriceUpdatePage";
import { VehicleCreatePage } from "../page/EVM/VehicleCreatePage";
import { VehiclePriceRulePage } from "../page/EVM/VehiclePriceRulePage";
import { AuthProtect } from "../components/atoms/AuthProtect";

// 🎯 Promotions
import EvmPromotionsPage from "../page/promotions/EvmPromotionsPage";
import PromotionEditPage from "../page/promotions/PromotionEditPage";

// 🧪 Test
import TestPage from "../page/TestPage";
import DealerDiscountPolicyPage from "../page/dealer-discount-policy/DealerDiscountPolicyPage";
import { AccountPage } from "../page/account/AccountPage";
import PromotionCreatePage from "../page/promotions/PromotionCreatePage";
import SaleOrderEvmPage from "../page/saleOrder/SaleOrderEvmPage";
import { SaleOrderDetailPage } from "../page/saleOrder/SaleOrderDetailPage";
import DealerPromotionsPage from "../page/promotions/DealerPromotionsPage";
import { CustomerPage } from "../page/customer/CustomerPage";
import { DealerPointRulePage } from "../page/customer/DealerPointRulePage";
import SaleOrderDealerPage from "../page/saleOrder/SaleOrderDealerPage";
import VehicleRequestPage from "../page/vehicle-request/VehicleRequestPage";
import { CustomerCreatePage } from "../page/customer/CustomerCreatePage";
import { CustomerEditPage } from "../page/customer/CustomerEditPage";
import { ReportPage } from "../page/report/ReportPage";

// -------------------- ROUTER --------------------
export const router = createBrowserRouter([
  // 🏠 Public Home
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
      // General
      { path: ROUTES.DEALERS, element: <DealerPage /> },
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: "test", element: <TestPage /> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <DealerDiscountPolicyPage />,
      },
      { path: ROUTES.ACCOUNT, element: <AccountPage /> }, // ✅ ADMIN full CRUD

      // ⚡ EV – Admin chỉ: List, Detail, Price Update
      { path: ROUTES.EVM_VEHICLE, element: <VehicleListPage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      {
        path: ROUTES.EVM_VEHICLE_PRICE_UPDATE,
        element: <VehiclePriceUpdatePage />,
      },
      { path: ROUTES.SALE_ORDERS, element: <SaleOrderEvmPage /> },
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
      // 👥 Dealer
      { path: ROUTES.DEALERS, element: <DealerPage /> },

      // ⚡ Vehicle – EVM full quản lý (trừ Price Update – là của Admin)
      { path: ROUTES.EVM_VEHICLE, element: <VehicleListPage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_RULES, element: <VehiclePriceRulePage /> },
      // ❌ Không mount: EVM_VEHICLE_PRICE_UPDATE

      // 👤 Profile
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },

      // ✅ Cho phép EVM_STAFF xem trang Account (tuỳ bạn kiểm soát read-only trong component)
      { path: ROUTES.ACCOUNT, element: <AccountPage /> },

      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: ROUTES.SALE_ORDERS, element: <SaleOrderEvmPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
    ],
  },

  // 👔 MANAGER + 👨‍🔧 DEALER_STAFF DASHBOARD
  {
    path: ROUTES.MANAGER, // hoặc ROUTES.DEALER nếu bạn có
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

      // ⚡ Vehicle – chỉ List + Detail (không có NEW/EDIT/BULK/PRICE/_RULES)
      { path: ROUTES.EVM_VEHICLE, element: <VehicleListPage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },

      // 👥 Customer
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
      { path: ROUTES.VEHICLE_REQUEST, element: <VehicleRequestPage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
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
      { path: ROUTES.REPORT, element: <ReportPage /> },
    ],
  },

  // ==== 404 ====
  {
    path: ROUTES.NOTFOUND, // *
    element: <NotFoundPage />,
  },
]);
