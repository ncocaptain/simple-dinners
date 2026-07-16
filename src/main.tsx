import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import { ShoppingSyncBridge } from "./cloud/ShoppingSyncBridge";

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <AuthProvider>
      <ShoppingSyncBridge />

      <BrowserRouter>
        <div className="appBackground">
          <App />
        </div>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);