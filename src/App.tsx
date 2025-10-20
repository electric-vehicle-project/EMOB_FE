import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { ConfigProvider } from "antd";
import { router } from "./config/router";
import { theme } from "./config/antd";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient();
  return (
    <ConfigProvider theme={theme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
          <ToastContainer />
        </PersistGate>
      </Provider>
    </ConfigProvider>
  );
}

export default App;
