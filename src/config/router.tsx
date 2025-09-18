import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProtect } from "../component/organism/AuthProtect";
import TestPage from "../page/TestPage";

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <h1>
        <Outlet />
      </h1>
    ),
    children: [
      {
        path: "test",
        element: (
          <AuthProtect>
            <TestPage />
          </AuthProtect>
        ),
      },
    ],
  },
  {
    path: "/*",
    element: <h1>Not Found</h1>,
  },
  {
    path: "/",
    element: <h1>Home</h1>,
  },
]);
