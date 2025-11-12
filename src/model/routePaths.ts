// src/model/routePaths.ts
export const ROUTES = {
  // ====== HOMEPAGE ======
  HOME: "/",

  // ====== ROLE ROOTS ======
  ADMIN: "/admin",
  MANAGER: "/manager",
  DEALER_STAFF: "/dealer_staff",
  EVM_STAFF: "/evm_staff",
  DASHBOARD: "/dashboard",

  // ====== AUTHENTICATION ======
  CALLBACK: "callback",
  AUTH: "/auth",
  LOGIN: "login",
  REGISTER: "register",
  FORGET_PASSWORD: "forget-password",
  FORGET_PASSWORD_OTP: "forget-password-otp",
  RESET_PASSWORD: "reset-password",

  // ====== ACCOUNT MANAGEMENT ======
  ACCOUNTS: "accounts",
  ACCOUNT_DETAIL: "accounts/:id",

  // ====== CUSTOMERS ======
  CUSTOMERS: "customers",
  DEALER_POINT_RULE: "dealerPoint",
  CUSTOMER_CREATE: "customers/create",
  CUSTOMER_DETAIL: "customers/:id",
  CUSTOMER_EDIT: "customers/edit/:id",

  // ====== ADMIN MODULES ======
  DEALER: "dealer",

  // ====== PROFILE ======
  PROFILE: "profile",
  PROFILE_INFO: "profile/info",
  PROFILE_CHANGE: "profile/changeInfo",
  PROFILE_RESET: "profile/resetpassword",
  PROFILE_SCHEDULE: "profile/viewSchedule",

  // ====== PROMOTIONS ======
  PROMOTIONS: "promotions",
  PROMOTION_CREATE: "promotions/create",
  PROMOTION_EDIT: "promotions/edit/:id",

  // ====== QUOTATION ======
  QUOTATION: "quotation",
  QUOTATION_CREATE: "quotations/create",
  QUOTATION_UPDATE: "quotations/edit/:id",
  QUOTATION_VIEW: "quotations/view/:id",
  QUOTATION_APPROVE: "quotation/approve/:id",
  // EVM
  EVM_VEHICLE: "evm/vehicle",
  EVM_VEHICLE_BULK: "evm/vehicle/bulk",
  EVM_VEHICLE_RULE: "evm/price-rule",
  EVM_VEHICLE_NEW: "evm/vehicle/new",
  EVM_VEHICLE_DETAIL: "evm/vehicle/:id",
  EVM_VEHICLE_EDIT: "evm/vehicle/edit/:id",
  EVM_VEHICLE_PRICE_UPDATE: "evm/vehicle/prices/:id",
  // DEALER_DISCOUNT_POLICY
  DEALER_DISCOUNT_POLICY: "dealer-discount-policy",
  // ====== SALE ORDER ======
  SALE_ORDER: "sale-order",
  SALE_ORDER_STAFF: "sale-order/staff",
  SALE_ORDER_DETAIL: "sale-order/:id",
  SALE_ORDER_STAFF_SUMMARY: "sale-order/staff-summary",
  // ====== REPORT ======
  REPORT: "report",
  REPORT_DETAIL: "report/:id",
  // ====== REPORT ======
  VEHICLE_REQUEST: "vehicle-request",

  // DELIVERY
  DELIVERY_CUSTOMERS: "delivery",
  DELIVERY_CUSTOMERS_DETAIL: "delivery/:id",
  DELIVERY_DEALERS: "delivery",
  DELIVERY_DEALERS_DETAIL: "delivery/:id",
  DELIVERY_CURRENT_DEALER: "delivery/current",
  DELIVERY_CURRENT_DEALER_DETAIL: "delivery/current/:id",

  ACCOUNT: "accounts",

  NOTFOUND: "*",

  //Detail Vehicle
  DEALER_STAFF_VEHICLE_DETAIL: "dealer-staff/vehicle/:id",
  MANAGER_VEHICLE_DETAIL: "manager/vehicle/:id",

  // CONTRACT
  CONTRACT: "contract",
  CONTRACT_WITH_EVM: "contract/with-evm",
  CONTRACT_WITH_EVM_DETAIL: "contract/with-evm/:id",
  CONTRACT_DETAIL: "contract/:id",

  // OVERVIEW
  OVERVIEW: "overview",

  // TEST DRIVE
  TEST_DRIVE: "test-drive",

  //InstallmentPlan
  INSTALLMENT_PLAN: "installment-plan",

  

  AI_DEMAND_FORECAST: "/vehicle/ai-demand-forecast",
};
