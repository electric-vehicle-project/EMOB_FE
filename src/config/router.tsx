import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";

import ReportPage from "../page/ReportPage";

import { DealerPage } from "../page/DealerPage";
import { ROUTES } from "../model/routePaths";
import { CustomerPage } from "../page/CustomerPage";
import { CustomerDetailPage } from "../page/CustomerDetailPage";
import { TestDrivePage } from "../page/TestDrivePage";
import InfoPage from "../page/profile/InfoPage";
import ChangeInfoPage from "../page/profile/ChangeInfoPage";
import ResetPasswordPage from "../page/profile/ResetPasswordPage";
import ViewSchedulePage from "../page/profile/ViewSchedulePage";

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },

  {
    path: ROUTES.ADMIN,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.DEALERS, element: <DealerPage /> },        // /dashboard/dealers
      { path: ROUTES.TESTDRIVE, element: <TestDrivePage /> },   // /dashboard/testdrive
      { path: "test", element: <TestPage /> },                  // /dashboard/test
      { path: "test/test01", element: <TestPage /> },   
      {
        path: ROUTES.REPORT, // => /admin/report
        element: <ReportPage />,
      },
      {
        path: ROUTES.CUSTOMERS, // => /admin/customers
        element: <CustomerPage />,
      },
    ],
  },

  {
    path: ROUTES.DASHBOARD,
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.PROFILE_INFO, element: <InfoPage /> },            // /dashboard/profile/info
      { path: ROUTES.PROFILE_CHANGE, element: <ChangeInfoPage /> },    // /dashboard/profile/changeInfo
      { path: ROUTES.PROFILE_RESET, element: <ResetPasswordPage /> },  // /dashboard/profile/resetpassword
      { path: ROUTES.PROFILE_SCHEDULE, element: <ViewSchedulePage /> },// /dashboard/profile/viewSchedule


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
