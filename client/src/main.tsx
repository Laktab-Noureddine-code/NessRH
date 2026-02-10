import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./config/i18n.ts";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router.tsx";
import { Provider } from "react-redux";
import appStore from "./redux/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={appStore}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </Provider>,
);
