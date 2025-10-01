import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import HomeRoute from "./routes/HomeRoute";
import DocRoute from "./routes/DocRoute";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <HomeRoute /> },
        { path: ":id", element: <DocRoute /> },
      ],
    },
  ],
  {
    basename: "/DV1677-ssr-frontend",
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
