import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import TestPage from "../page/TestPage";
import { DealerPage } from "../page/DealerPage";
import { ROUTES } from "../model/routePaths";
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
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      { path: "dealers", element: <DealerPage /> },       //admin/dealers
      { path: "testdrive", element: <TestDrivePage /> },  //admin/testdrive
      { path: "test", element: <TestPage /> },            //admin/test
      { path: "test/test01", element: <TestPage /> },     //admin/test/test01
    ],
  },


  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "profile/info", element: <InfoPage /> },                    //dashboard/profile/info
      { path: "profile/changeInfo", element: <ChangeInfoPage /> },        //dashboard/profile/changeInfo
      { path: "profile/resetpassword", element: <ResetPasswordPage /> },  //dashboard/profile/resetpassword
      { path: "profile/viewSchedule", element: <ViewSchedulePage /> },    //dashboard/profile/viewSchedule
    ],
  },

  {
    path: ROUTES.NOTFOUND,
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
