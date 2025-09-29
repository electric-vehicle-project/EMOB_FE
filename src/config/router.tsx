// import { AuthProtect } from "../components/organisms/AuthProtect";
import { NotFoundPage } from "../page/404Page";

import { createBrowserRouter } from "react-router-dom";
import HomePage from "../page/HomePage";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/*",
    element: <NotFoundPage />,
  },
]);
