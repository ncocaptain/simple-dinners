import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import { BiometricUnlockGate } from "./auth/BiometricUnlockGate";
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
      <BiometricUnlockGate>
        <PlusEntitlementProvider>
        <PlusCloudSync />

        <BrowserRouter>
          <div className="appBackground">
            <App />
          </div>
        </BrowserRouter>
        </PlusEntitlementProvider>
      </BiometricUnlockGate>
    </AuthProvider>
  </React.StrictMode>,
);