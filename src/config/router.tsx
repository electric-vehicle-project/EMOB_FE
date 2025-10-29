// /src/router/router.tsx
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
import VehiclePage from "../page/EVM/VehiclePage";

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
  // Admin: xem ALL mẫu xe + ALL lô xe, cấu hình giá; KHÔNG tạo/sửa/bulk xe
  {
    path: ROUTES.ADMIN,
    element: (
      <AuthProtect allowedRoles={["ADMIN"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.DEALERS, element: <DealerPage /> }, // /admin/dealers
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <DealerDiscountPolicyPage />,
      },

      // ⚡ Vehicle (View-only + Price Config)
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> }, // danh sách
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> }, // chi tiết
      {
        path: ROUTES.EVM_VEHICLE_PRICE_UPDATE,
        element: <VehiclePriceUpdatePage />,
      }, // cập nhật giá
      { path: ROUTES.EVM_VEHICLE_RULES, element: <VehiclePriceRulePage /> }, // quy tắc giá
      // ❌ Không mount: VehicleCreatePage / VehicleEditPage / VehicleBulkPage
      { path: "test", element: <TestPage /> },
    ],
  },

  // ⚡ EVM STAFF DASHBOARD
  // EVM Staff: xem ALL mẫu xe + ALL lô xe, CREATE/EDIT/BULK; KHÔNG cấu hình giá
  {
    path: ROUTES.EVM_STAFF,
    element: (
      <AuthProtect allowedRoles={["EVM_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      // 👥 Dealer Management
      { path: ROUTES.DEALERS, element: <DealerPage /> },

      // ⚡ Vehicle (CRUD + Bulk)
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      // ❌ Không mount: VehiclePriceUpdatePage / VehiclePriceRulePage

      // 👤 Profile Pages
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },
    ],
  },

  // 🟠 MANAGER DASHBOARD (View-only)
  // Manager: xem ALL mẫu xe + ALL lô xe; KHÔNG create/edit/bulk/price/rules
  {
    path: ROUTES.MANAGER,
    element: (
      <AuthProtect allowedRoles={["MANAGER"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },

      // ⚡ Vehicle (view only)
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },

      // ❌ Không mount: bulk/new/edit/price-update/rules
      { path: `${ROUTES.CUSTOMERS}/:id`, element: <CustomerDetailPage /> },
    ],
  },

  // 🟣 DEALER STAFF DASHBOARD (View-only)
  // Dealer Staff: xem ALL mẫu xe + ALL lô xe; KHÔNG create/edit/bulk/price/rules
  {
    path: ROUTES.DEALER_STAFF,
    element: (
      <AuthProtect allowedRoles={["DEALER_STAFF"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      // ⚡ Vehicle (view only)
      { path: ROUTES.EVM_VEHICLE, element: <VehiclePage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },

      // 👤 Profile Pages (nếu bạn muốn bật cho Dealer Staff)
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },

      // ❌ Không mount: bulk/new/edit/price-update/rules
    ],
  },

  // 🚫 404
  { path: ROUTES.NOTFOUND, element: <NotFoundPage /> },
]);
