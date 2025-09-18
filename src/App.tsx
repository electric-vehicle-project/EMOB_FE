import { RouterProvider } from "react-router-dom";

import { ToastContainer } from "react-toastify";

import { ConfigProvider } from "antd";
import { router } from "./config/router";
import { theme } from "./config/antd";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
          <ToastContainer />
        </PersistGate>
      </Provider>
    </ConfigProvider>
  );
}

export default App;
