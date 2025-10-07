import { createBrowserRouter, type RouteObject } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import HomePage from "../page/HomePage";
import { NotFoundPage } from "../page/404Page";
import { DealerPage } from "../page/DealerPage"; // CRUD Dealer
import { ROUTES } from "../model/routePaths";
import { CustomerPage } from "../page/CustomerPage";
import { CustomerDetailPage } from "../page/CustomerDetailPage";

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.ADMIN,
    element: <DashboardLayout />,
    children: [
      {
        path: ROUTES.DEALERS, // => /admin/dealers
        element: <DealerPage />,
      },
      {
        path: ROUTES.CUSTOMERS, // => /admin/customers
        element: <CustomerPage />,
      },
      {
        path: `${ROUTES.CUSTOMERS}/:id`, // => /admin/customers/(id)
        element: <CustomerDetailPage />,
      },
    ],
  },
  {
    path: ROUTES.NOTFOUND, // bắt tất cả path không khớp
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
