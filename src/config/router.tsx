import { createBrowserRouter } from "react-router-dom";
// import { AuthProtect } from "../components/organisms/AuthProtect";
import { NotFoundPage } from "../page/404Page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <NotFoundPage />,
  },
  {
    path: "/*",
    element: <h1>Not Found</h1>,
  },
]);
