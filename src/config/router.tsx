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
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import { AuthProtect } from "../components/atoms/AuthProtect";
import ProfilePage from "../page/profile/ProfilePage";
import { DealerPage } from "../page/DealerPage";
import { AccountPage } from "../page/account/AccountPage";
import SaleOrderEvmPage from "../page/saleOrder/SaleOrderEvmPage";
import SaleOrderDealerPage from "../page/saleOrder/SaleOrderDealerPage";
import { SaleOrderDetailPage } from "../page/saleOrder/SaleOrderDetailPage";
import { ReportPage } from "../page/report/ReportPage";
import SaleOrderStaffPage from "../page/saleOrder/SaleOrderStaffPage";
import SaleOrderByStaffPage from "../page/saleOrder/SaleOrderByStaffPage";
import { CustomerPage } from "../page/customer/CustomerPage";
import CustomerDetailPage from "../page/customer/CustomerDetailPage";
import { CustomerCreatePage } from "../page/customer/CustomerCreatePage";
import { CustomerEditPage } from "../page/customer/CustomerEditPage";
import EvmPromotionsPage from "../page/promotions/EvmPromotionsPage";
import DealerPromotionsPage from "../page/promotions/DealerPromotionsPage";
// -------------------- ROUTER --------------------
export const router = createBrowserRouter([
  // ==== HOME ====
  { path: ROUTES.HOME, element: <HomePage /> },

  // ==== AUTH ====
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

  // ==== DASHBOARD ====
  {
    path: ROUTES.DASHBOARD,
    element: (
      <AuthProtect
        allowedRoles={["ADMIN", "MANAGER", "DEALER_STAFF", "EVM_STAFF"]}
      >
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [{ path: ROUTES.PROFILE, element: <ProfilePage /> }],
  },

  // ==== ADMIN ====
  {
    path: ROUTES.ADMIN,
    element: (
      <AuthProtect allowedRoles={["ADMIN"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      // ⚡ General
      { path: ROUTES.OVERVIEW, element: <h1>Overview</h1> },
      { path: ROUTES.DEALER, element: <DealerPage /> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <h1>Discount Policy</h1>,
      },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <h1>Vehicle Price Rule</h1> },
      { path: ROUTES.ACCOUNT, element: <AccountPage /> },
      { path: ROUTES.EVM_VEHICLE, element: <h1>Electric Vehicle</h1> },
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <h1>Vehicle Request</h1> },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderEvmPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      { path: ROUTES.CONTRACT, element: <h1>Contract</h1> },
      { path: ROUTES.DELIVERY, element: <h1>Delivery</h1> },
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
      { path: ROUTES.OVERVIEW, element: <h1>Overview</h1> },
      { path: ROUTES.EVM_VEHICLE, element: <h1>Electric Vehicle</h1> },
      { path: ROUTES.DEALER, element: <h1>Dealer</h1> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <h1>Vehicle Price Rule</h1> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <h1>Discount Policy</h1>,
      },
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <h1>Vehicle Request</h1> },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderEvmPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      { path: ROUTES.CONTRACT, element: <h1>Contract</h1> },
      { path: ROUTES.DELIVERY, element: <h1>Delivery</h1> },
    ],
  },
  // ==== MANAGER ====
  {
    path: ROUTES.MANAGER,
    element: (
      <AuthProtect allowedRoles={["MANAGER"]}>
        <DashboardLayout />
      </AuthProtect>
    ),
    children: [
      { path: ROUTES.OVERVIEW, element: <h1>Overview</h1> },
      { path: ROUTES.EVM_VEHICLE, element: <h1>Electric Vehicle</h1> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <h1>Vehicle Price Rule</h1> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <h1>Discount Policy</h1>,
      },
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <h1>Vehicle Request</h1> },
      { path: ROUTES.TEST_DRIVE, element: <h1>Test Drive</h1> },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderDealerPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      {
        path: ROUTES.SALE_ORDER_STAFF_SUMMARY,
        element: <SaleOrderByStaffPage />,
      },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.CONTRACT, element: <h1>Contract</h1> },
      { path: ROUTES.DELIVERY, element: <h1>Delivery</h1> },
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> },
      { path: ROUTES.CUSTOMER_CREATE, element: <CustomerCreatePage /> },
      { path: ROUTES.CUSTOMER_EDIT, element: <CustomerEditPage /> },
      { path: ROUTES.QUOTATION, element: <h1>Quotation</h1> },
      { path: ROUTES.ACCOUNT, element: <h1>Account</h1> },
      { path: ROUTES.DEALER_POINT_RULE, element: <h1>Dealer Point Rule</h1> },
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
      { path: ROUTES.OVERVIEW, element: <h1>Overview</h1> },
      { path: ROUTES.EVM_VEHICLE, element: <h1>Electric Vehicle</h1> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <h1>Vehicle Price Rule</h1> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <h1>Discount Policy</h1>,
      },
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <h1>Vehicle Request</h1> },
      { path: ROUTES.TEST_DRIVE, element: <h1>Test Drive</h1> },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderDealerPage /> },
      { path: ROUTES.SALE_ORDER_STAFF, element: <SaleOrderStaffPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.CONTRACT, element: <h1>Contract</h1> },
      { path: ROUTES.DELIVERY, element: <h1>Delivery</h1> },
      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> },
      { path: ROUTES.CUSTOMER_CREATE, element: <CustomerCreatePage /> },
      { path: ROUTES.CUSTOMER_EDIT, element: <CustomerEditPage /> },
      { path: ROUTES.QUOTATION, element: <h1>Quotation</h1> },
      { path: ROUTES.DEALER_POINT_RULE, element: <h1>Dealer Point Rule</h1> },
    ],
  },

  // ==== 404 ====
  {
    path: ROUTES.NOTFOUND, // *
    element: <NotFoundPage />,
  },
]);
