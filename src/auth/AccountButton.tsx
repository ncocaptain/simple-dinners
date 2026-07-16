import { useState } from "react";
import { AccountModal } from "./AccountModal";
import { useAuth } from "./AuthContext";
import "./AccountButton.css";

export function AccountButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isSignedIn, loading, user } = useAuth();

  const accountLabel = loading
    ? "Account"
    : isSignedIn
      ? user?.email ?? "Account"
      : "Plus";

  return (
    <>
      <button
        type="button"
        className={`sd-account-button ${isSignedIn ? "is-signed-in" : ""
          }`}
        onClick={() => setIsModalOpen(true)}
        aria-label={
          isSignedIn
            ? "Open Simple Dinners account"
            : "Open Simple Dinners Plus"
        }
      >
        <span
          className="sd-account-button-icon"
          aria-hidden="true"
        >
          {isSignedIn ? "✓" : "+"}
        </span>

        <span className="sd-account-button-text">
          {accountLabel}
        </span>
      </button>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}