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
import CustomerDetailPage from "../page/customer/CustomerDetailPage";

// ⚡ EV Management
import { VehiclePage } from "../page/evm/VehiclePage";
import { VehicleBulkPage } from "../page/evm/VehicleBulkPage";
import { VehicleDetailPage } from "../page/evm/VehicleDetailPage";
import { VehicleEditPage } from "../page/evm/VehicleEditPage";
import { VehiclePriceUpdatePage } from "../page/evm/VehiclePriceUpdatePage";
import { VehicleCreatePage } from "../page/evm/VehicleCreatePage";
import { VehiclePriceRulePage } from "../page/evm/VehiclePriceRulePage";
import { AuthProtect } from "../components/atoms/AuthProtect";

// 🎯 Promotions
import EvmPromotionsPage from "../page/promotions/EvmPromotionsPage";
import PromotionEditPage from "../page/promotions/PromotionEditPage";

// 🧪 Test
import TestPage from "../page/TestPage";
import DealerDiscountPolicyPage from "../page/dealer-discount-policy/DealerDiscountPolicyPage";
import { AccountPage } from "../page/account/AccountPage";
import { ContractDetailDealerPage } from "../page/contract/ContractDetailDealerPage";
import { ContractCurrentDealerPage } from "../page/contract/ContractCurrentDealerPage";
import { ContractAllCustomersPage } from "../page/contract/ContractAllCustomersPage";

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
      { path: ROUTES.CONTRACT, element: <ContractCurrentDealerPage /> },
      { path: ROUTES.DEALERS, element: <DealerPage /> }, // /admin/dealers
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: "test", element: <TestPage /> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <DealerDiscountPolicyPage />,
      },
      { path: ROUTES.ACCOUNT, element: <AccountPage /> }, // ✅ ADMIN full CRUD
    ],
  },

  // ⚡ EVM STAFF DASHBOARD (thêm quyền xem trang Account)
  {
    path: ROUTES.EVM_STAFF,
    element: (
      <AuthProtect allowedRoles={["EVM_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [

      { path: ROUTES.CONTRACT, element: <ContractCurrentDealerPage /> },
      // 👥 Dealer Management
      { path: ROUTES.DEALERS, element: <DealerPage /> }, // /evm_staff/dealers

      // ⚡ Vehicle Management
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      {
        path: ROUTES.EVM_VEHICLE_PRICE_UPDATE,
        element: <VehiclePriceUpdatePage />,
      },
      { path: ROUTES.EVM_VEHICLE_RULES, element: <VehiclePriceRulePage /> },

      // 👤 Profile Pages
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },

      // ✅ Cho phép EVM_STAFF xem trang Account (read-only)
      { path: ROUTES.ACCOUNT, element: <AccountPage /> },
    ],
  },

  // ==== MANAGER ==== (không thêm trang Account để cấm truy cập)
  {
    path: ROUTES.MANAGER,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.CONTRACT, element: <ContractCurrentDealerPage/> },
      { path: ROUTES.CONTRACT_DETAILS, element: <ContractDetailDealerPage /> },
      { path: ROUTES.CONTRACT_CUSTOMERS, element: <ContractAllCustomersPage /> },

      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      {
        path: ROUTES.EVM_VEHICLE_PRICE_UPDATE,
        element: <VehiclePriceUpdatePage />,
      },
      { path: ROUTES.EVM_VEHICLE_RULES, element: <VehiclePriceRulePage /> },
      { path: `${ROUTES.CUSTOMERS}/:id`, element: <CustomerDetailPage /> },
    ],
  },

  // 🚫 404
  { path: ROUTES.NOTFOUND, element: <NotFoundPage /> },


  // route for testing

]);
