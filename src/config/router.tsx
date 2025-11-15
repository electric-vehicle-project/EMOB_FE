// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AuthLayout from "../layout/AuthLayout";
import { ROUTES } from "../model/routePaths";

// 🔐 Auth Pages

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
import VehicleRequestPage from "../page/vehicle-request/VehicleRequestPage";
import PromotionEditPage from "../page/promotions/PromotionEditPage";
import PromotionCreatePage from "../page/promotions/PromotionCreatePage";
import { TestDrivePage } from "../page/test-drive/TestDrivePage";
import { LoginCard } from "../components/organisms/auth/LoginCard";
import { ForgetPasswordCard } from "../components/organisms/auth/ForgetPasswordCard";
import { OTPCard } from "../components/organisms/auth/OTPCard";
import { ResetPasswordCard } from "../components/organisms/auth/ResetPasswordCard";
import GoogleCallback from "../page/GoogleCallback";
import OverviewRevenueDealer from "../page/overview/OverviewRevenueDealer";
import { ContractDetailDealerPage } from "../page/contract/ContractDetailDealerPage";
import { ContractAllDealersPage } from "../page/contract/ContractAllDealersPage";
import { DeliveryEVMAndDealerPage } from "../page/delivery/DeliveryEVMAndDealerPage";
import QuotationPage from "../page/quotation/QuotationPage";
import AdminVehicleRequestPage from "../page/vehicle-request/VehicleRequestForAdminPage";
import DealerDashboardPage from "../page/overview/OverviewRevenueCustomer";
import { InstallmentPlanPage } from "../page/installmentPlan/IntallmentPlanPage";
import { ContractCurrentDealerPage } from "../page/contract/ContractCurrentDealerPage";
import { DeliveryDealerDetailPage } from "../page/delivery/DeliveryDealerDetailPage";
import { DeliveryEVMAndCurrentDealerPage } from "../page/delivery/DeliveryEVMAndCurrentDealerPage";
import { DeliveryDealerAndCustomerPage } from "../page/delivery/DeliveryDealerAndCustomerPage";
import { DeliveryCustomerDetailPage } from "../page/delivery/DeliveryCustomerDetailPage";
import { ContractAllCustomersPage } from "../page/contract/ContractAllCustomersPage";
import { ContractDetailCustomerPage } from "../page/contract/ContractDetailCustomerPage";
import DealerPointRuleAdminPage from "../page/dealer-point-rule/DealerPointRuleAdminPage";
import VehicleListPage from "../page/EVM/VehicleListPage";
import VehicleBulkPage from "../page/EVM/VehicleBulkPage";
import VehicleDetailPage from "../page/EVM/VehicleDetailPage";
import VehicleCreatePage from "../page/EVM/VehicleCreatePage";
import VehicleEditPage from "../page/EVM/VehicleEditPage";
import VehiclePriceRulePage from "../page/EVM/VehiclePriceRulePage";
import { VehiclePriceUpdatePage } from "../page/EVM/VehiclePriceUpdatePage";
import DealerPointRulePage from "../page/dealer-point-rule/DealerPointRulePage";
import { TestDriveByCurrentStaffPage } from "../page/test-drive/TestDriveByCurrentStaffPage";
import { DealerDiscountPolicyPage } from "../page/dealer-discount-policy/DealerDiscountPolicyPage";
import ReportDetailPage from "../page/report/ReportDetailPage";
import { InstallmentPlanCustomersPage } from "../page/installmentPlan/InstallmentPlanCustomerPage";
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
  { path: ROUTES.CALLBACK, element: <GoogleCallback /> },

  // ==== DASHBOARD (default for all roles) ====
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
      { index: true, element: <Navigate to={ROUTES.PROFILE} replace /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
      { path: ROUTES.ACCOUNT, element: <AccountPage /> },
      { path: ROUTES.OVERVIEW, element: <OverviewRevenueDealer /> },
      { path: ROUTES.DEALER, element: <DealerPage /> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <DealerDiscountPolicyPage />,
      },
      { path: ROUTES.DEALER_POINT_RULE, element: <DealerPointRuleAdminPage /> },

      { path: ROUTES.EVM_VEHICLE, element: <VehicleListPage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <VehiclePriceRulePage /> },
      {
        path: ROUTES.EVM_VEHICLE_PRICE_UPDATE,
        element: <VehiclePriceUpdatePage />,
      },

      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <AdminVehicleRequestPage /> },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderEvmPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      { path: ROUTES.CONTRACT, element: <ContractAllDealersPage /> },
      { path: ROUTES.CONTRACT_DETAIL, element: <ContractDetailDealerPage /> },
      { path: ROUTES.DELIVERY_DEALERS, element: <DeliveryEVMAndDealerPage /> },
      {
        path: ROUTES.DELIVERY_DEALERS_DETAIL,
        element: <DeliveryDealerDetailPage />,
      },
      { path: ROUTES.INSTALLMENT_PLAN, element: <InstallmentPlanPage /> },
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
      { index: true, element: <Navigate to={ROUTES.PROFILE} replace /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <AdminVehicleRequestPage /> },

      { path: ROUTES.EVM_VEHICLE, element: <VehicleListPage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_NEW, element: <VehicleCreatePage /> },
      { path: ROUTES.EVM_VEHICLE_EDIT, element: <VehicleEditPage /> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <VehiclePriceRulePage /> },

      { path: ROUTES.DEALER, element: <DealerPage /> },

      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <DealerDiscountPolicyPage />,
      },
      { path: ROUTES.PROMOTIONS, element: <EvmPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderEvmPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      { path: ROUTES.CONTRACT, element: <ContractAllDealersPage /> },
      { path: ROUTES.CONTRACT_DETAIL, element: <ContractDetailDealerPage /> },
      { path: ROUTES.DELIVERY_DEALERS, element: <DeliveryEVMAndDealerPage /> },
      {
        path: ROUTES.DELIVERY_DEALERS_DETAIL,
        element: <DeliveryDealerDetailPage />,
      },
      { path: ROUTES.INSTALLMENT_PLAN, element: <InstallmentPlanPage /> },
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
      { index: true, element: <Navigate to={ROUTES.PROFILE} replace /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
      { path: ROUTES.ACCOUNT, element: <AccountPage /> },
      { path: ROUTES.OVERVIEW, element: <DealerDashboardPage /> },

      { path: ROUTES.EVM_VEHICLE, element: <VehicleListPage /> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <VehiclePriceRulePage /> },

      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <VehiclePriceRulePage /> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <DealerDiscountPolicyPage />,
      },
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <VehicleRequestPage /> },
      { path: ROUTES.TEST_DRIVE, element: <TestDrivePage /> },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderDealerPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      {
        path: ROUTES.SALE_ORDER_STAFF_SUMMARY,
        element: <SaleOrderByStaffPage />,
      },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.REPORT_DETAIL, element: <ReportDetailPage /> },
      { path: ROUTES.CONTRACT, element: <ContractAllCustomersPage /> },
      {
        path: ROUTES.CONTRACT_WITH_EVM,
        element: <ContractCurrentDealerPage />,
      },
      { path: ROUTES.CONTRACT_DETAIL, element: <ContractDetailCustomerPage /> },
      {
        path: ROUTES.CONTRACT_WITH_EVM_DETAIL,
        element: <ContractDetailDealerPage />,
      },

      {
        path: ROUTES.DELIVERY_CUSTOMERS,
        element: <DeliveryDealerAndCustomerPage />,
      },
      {
        path: ROUTES.DELIVERY_CUSTOMERS_DETAIL,
        element: <DeliveryCustomerDetailPage />,
      },
      {
        path: ROUTES.DELIVERY_CURRENT_DEALER,
        element: <DeliveryEVMAndCurrentDealerPage />,
      },
      {
        path: ROUTES.DELIVERY_CURRENT_DEALER_DETAIL,
        element: <DeliveryDealerDetailPage />,
      },

      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> },
      { path: ROUTES.QUOTATION, element: <QuotationPage /> },
      { path: ROUTES.DEALER_POINT_RULE, element: <DealerPointRulePage /> },
      { path: ROUTES.INSTALLMENT_PLAN, element: <InstallmentPlanPage /> },
      {
        path: ROUTES.INSTALLMENT_PLAN_CUSTOMERS,
        element: <InstallmentPlanCustomersPage />,
      },
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
      { index: true, element: <Navigate to={ROUTES.PROFILE} replace /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },

      { path: ROUTES.EVM_VEHICLE, element: <VehicleListPage /> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <VehiclePriceRulePage /> },
      { path: ROUTES.EVM_VEHICLE_BULK, element: <VehicleBulkPage /> },
      { path: ROUTES.EVM_VEHICLE_DETAIL, element: <VehicleDetailPage /> },
      { path: ROUTES.EVM_VEHICLE_RULE, element: <VehiclePriceRulePage /> },
      {
        path: ROUTES.DEALER_DISCOUNT_POLICY,
        element: <DealerDiscountPolicyPage />,
      },
      { path: ROUTES.PROMOTIONS, element: <DealerPromotionsPage /> },
      { path: ROUTES.PROMOTION_EDIT, element: <PromotionEditPage /> },
      { path: ROUTES.PROMOTION_CREATE, element: <PromotionCreatePage /> },
      { path: ROUTES.VEHICLE_REQUEST, element: <VehicleRequestPage /> },
      { path: ROUTES.TEST_DRIVE, element: <TestDrivePage /> },
      {
        path: ROUTES.TEST_DRIVE_BY_CURRENT_STAFF,
        element: <TestDriveByCurrentStaffPage />,
      },
      { path: ROUTES.SALE_ORDER, element: <SaleOrderDealerPage /> },
      { path: ROUTES.SALE_ORDER_STAFF, element: <SaleOrderStaffPage /> },
      { path: ROUTES.SALE_ORDER_DETAIL, element: <SaleOrderDetailPage /> },
      { path: ROUTES.REPORT, element: <ReportPage /> },
      { path: ROUTES.REPORT_DETAIL, element: <ReportDetailPage /> },
      { path: ROUTES.CONTRACT, element: <ContractAllCustomersPage /> },
      {
        path: ROUTES.CONTRACT_WITH_EVM,
        element: <ContractCurrentDealerPage />,
      },
      { path: ROUTES.CONTRACT_DETAIL, element: <ContractDetailCustomerPage /> },
      {
        path: ROUTES.CONTRACT_WITH_EVM_DETAIL,
        element: <ContractDetailDealerPage />,
      },

      {
        path: ROUTES.DELIVERY_CUSTOMERS,
        element: <DeliveryDealerAndCustomerPage />,
      },
      {
        path: ROUTES.DELIVERY_CUSTOMERS_DETAIL,
        element: <DeliveryCustomerDetailPage />,
      },
      {
        path: ROUTES.DELIVERY_CURRENT_DEALER,
        element: <DeliveryEVMAndCurrentDealerPage />,
      },
      {
        path: ROUTES.DELIVERY_CURRENT_DEALER_DETAIL,
        element: <DeliveryDealerDetailPage />,
      },

      { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
      { path: ROUTES.CUSTOMER_DETAIL, element: <CustomerDetailPage /> },
      { path: ROUTES.CUSTOMER_CREATE, element: <CustomerCreatePage /> },
      { path: ROUTES.CUSTOMER_EDIT, element: <CustomerEditPage /> },
      { path: ROUTES.QUOTATION, element: <QuotationPage /> },
      { path: ROUTES.DEALER_POINT_RULE, element: <DealerPointRulePage /> },
      { path: ROUTES.INSTALLMENT_PLAN, element: <InstallmentPlanPage /> },
      {
        path: ROUTES.INSTALLMENT_PLAN_CUSTOMERS,
        element: <InstallmentPlanCustomersPage />,
      },
    ],
  },

  // ==== 404 ====
  { path: ROUTES.NOTFOUND, element: <NotFoundPage /> },
]);
