import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import { ShoppingSyncBridge } from "./cloud/ShoppingSyncBridge";
import {
  ShoppingListConflictModal,
} from "./cloud/ShoppingListConflictModal";
import {
  WeeklyPlanConflictModal,
} from "./cloud/WeeklyPlanConflictModal";
import {
  CookbookConflictModal,
} from "./cloud/CookbookConflictModal";

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <AuthProvider>
      <ShoppingSyncBridge />
      <ShoppingListConflictModal />
      <WeeklyPlanConflictModal />
      <CookbookConflictModal />

      <BrowserRouter>
        <div className="appBackground">
          <App />
        </div>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);