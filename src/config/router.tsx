import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { LoginCard } from "../components/organisms/LoginCard";
import { ForgetPasswordCard } from "../components/organisms/ForgetPasswordCard";
import { OTPCard } from "../components/organisms/OTPCard";
import { ResetPasswordCard } from "../components/organisms/ResetPasswordCard";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";

import ReportPage from "../page/ReportPage";
import { DealerPage } from "../page/DealerPage";
import { ROUTES } from "../model/routePaths";
import AuthLayout from "../layout/AuthLayout";

import { TestDrivePage } from "../page/TestDrivePage";
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";
import { CustomerPage } from "../page/customer/CustomerPage";
import CustomerDetailPage from "../page/customer/CustomerDetailPage";

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.AUTH,
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginCard />,
      },
      {
        path: ROUTES.FORGET_PASSWORD,
        element: <ForgetPasswordCard />,
      },
      {
        path: ROUTES.FORGET_PASSWORD_OTP,
        element: <OTPCard/>,
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: <ResetPasswordCard />,
      },
      
    ],
  },

  {
    path: ROUTES.ADMIN,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.DEALERS, element: <DealerPage /> }, // /dashboard/dealers
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> }, // /dashboard/testdrive
      { path: "test", element: <TestPage /> }, // /dashboard/test
      { path: "test/test01", element: <TestPage /> },
      {
        path: ROUTES.REPORT, // => /admin/report
        element: <ReportPage />,
      },
      {
        path: ROUTES.CUSTOMERS, // => /admin/customers
        element: <CustomerPage/>,
      },
    ],
  },

  {
    path: ROUTES.DASHBOARD,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> }, // /dashboard/profile/info
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> }, // /dashboard/profile/changeInfo
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> }, // /dashboard/profile/resetpassword
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> }, // /dashboard/profile/viewSchedule

      {
        path: "test", // => /admin/test
        element: <TestPage />,
      },
      {
        path: `${ROUTES.CUSTOMERS}/:id`, // => /admin/customers/(id)
        element: <CustomerDetailPage />,
      },
    ],
  },

  {
    path: ROUTES.NOTFOUND,
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);



// import { createBrowserRouter, type RouteObject } from "react-router-dom";
// import DashboardLayout from "../layout/DashboardLayout";
// import AuthLayout from "../layout/AuthLayout";
// import { ROUTES } from "../model/routePaths";
// import { AuthProtect } from "../components/atoms/AuthProtect";

// import { LoginCard } from "../components/organisms/LoginCard";
// import { ForgetPasswordCard } from "../components/organisms/ForgetPasswordCard";
// import { OTPCard } from "../components/organisms/OTPCard";
// import { ResetPasswordCard } from "../components/organisms/ResetPasswordCard";
// import HomePage from "../page/HomePage";
// import { NotFoundPage } from "../page/404Page";
// import ReportPage from "../page/ReportPage";

// // ===== DEALER PAGES =====
// import { DealerPage } from "../page/DealerPage";
// import { CustomerPage } from "../page/CustomerPage";
// import { CustomerDetailPage } from "../page/CustomerDetailPage";
// import { TestDrivePage } from "../page/TestDrivePage";

// // ===== PROFILE PAGES =====
// import InfoPage from "../page/profile/InfoPage";
// import ChangeInfoPage from "../page/profile/ChangeInfoPage";
// import ResetPasswordPage from "../page/profile/ResetPasswordPage";
// import ViewSchedulePage from "../page/profile/ViewSchedulePage";
// import TestPage from "../page/TestPage";

// export const routes: RouteObject[] = [
//   { path: ROUTES.HOME, element: <HomePage /> },

//   // 🔐 Auth layout cho login / reset password
//   {
//     path: ROUTES.AUTH, // /auth
//     element: <AuthLayout />,
//     children: [
//       { path: ROUTES.LOGIN, element: <LoginCard /> },
//       { path: ROUTES.FORGET_PASSWORD, element: <ForgetPasswordCard /> },
//       { path: ROUTES.FORGET_PASSWORD_OTP, element: <OTPCard /> },
//       { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordCard /> },
//     ],
//   },

//   // 🧩 ADMIN + EVM_STAFF
//   {
//     path: ROUTES.ADMIN,
//     element: (
//       <AuthProtect allowedRoles={["ADMIN", "EVM_STAFF"]}>
//         <DashboardLayout />
//       </AuthProtect>
//     ),
//     children: [
//       { path: ROUTES.DEALERS, element: <DealerPage /> },
//       { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },
//       { path: ROUTES.REPORT, element: <ReportPage /> },
//       { path: ROUTES.CUSTOMERS, element: <CustomerPage /> },
//       { path: `${ROUTES.CUSTOMERS}/:id`, element: <CustomerDetailPage /> },
//     ],
//   },

//   // 🧩 DEALER_MANAGER + DEALER_STAFF
//   {
//     path: ROUTES.DASHBOARD,
//     element: (
//       <AuthProtect allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]}>
//         <DashboardLayout />
//       </AuthProtect>
//     ),
//     children: [
//       { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },
//       { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },
//       { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },
//       { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },
//       { path: "test", element: <TestPage /> },
//     ],
//   },

//   // 🧍 CUSTOMER
//   {
//     path: "/customer",
//     element: (
//       <AuthProtect allowedRoles={["CUSTOMER"]}>
//         <DashboardLayout />
//       </AuthProtect>
//     ),
//     children: [
//       { path: "profile/info", element: <InfoPage /> },
//       { path: "profile/changeInfo", element: <ChangeInfoPage /> },
//       { path: "profile/resetPassword", element: <ResetPasswordPage /> },
//     ],
//   },

//   // 🚫 404
//   { path: ROUTES.NOTFOUND, element: <NotFoundPage /> },
// ];

// //       EXPORT ROUTER
// export const router = createBrowserRouter(routes);
