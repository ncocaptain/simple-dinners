import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import {
  PlusEntitlementProvider,
} from "./plus/PlusEntitlementContext";
import {
  PlusCloudSync,
} from "./plus/PlusCloudSync";

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <AuthProvider>
      <PlusEntitlementProvider>
        <PlusCloudSync />

        <BrowserRouter>
          <div className="appBackground">
            <App />
          </div>
        </BrowserRouter>
      </PlusEntitlementProvider>
    </AuthProvider>
  </React.StrictMode>,
);