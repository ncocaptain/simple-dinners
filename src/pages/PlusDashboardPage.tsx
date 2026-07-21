import {
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  useShoppingSyncStatus,
} from "../cloud/shoppingSyncState";
import {
  useWeeklyPlanSyncStatus,
} from "../cloud/weeklyPlanSyncState";
import {
  useCookbookSyncStatus,
} from "../cloud/cookbookSyncState";
import "./PlusDashboardPage.css";

type FeatureCardProps = {
  title: string;
  description: string;
  to: string;
  icon: typeof Sparkles;
  badge?: string;
  onClick?: () => void;
};

function FeatureCard({
  title,
  description,
  to,
  icon: Icon,
  badge,
  onClick,
}: FeatureCardProps) {
  return (
    <Link
      to={to}
      className="sd-plus-feature-card"
      onClick={onClick}
    >
      <div className="sd-plus-feature-icon">
        <Icon
          size={23}
          aria-hidden="true"
        />
      </div>

      <div className="sd-plus-feature-copy">
        <div className="sd-plus-feature-heading">
          <h3>{title}</h3>

          {badge && (
            <span>{badge}</span>
          )}
        </div>

        <p>{description}</p>
      </div>

      <ChevronRight
        size={20}
        aria-hidden="true"
        className="sd-plus-feature-arrow"
      />
    </Link>
  );
}

function SyncItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const isSynced = status === "synced";

  return (
    <div className="sd-plus-sync-item">
      <CheckCircle2
        size={17}
        aria-hidden="true"
        className={
          isSynced
            ? "is-synced"
            : undefined
        }
      />

      <span>{label}</span>

      <strong>
        {status === "synced"
          ? "Synced"
          : status === "syncing"
            ? "Syncing…"
            : status === "connecting"
              ? "Connecting…"
              : status === "offline"
                ? "Offline"
                : status === "error"
                  ? "Needs attention"
                  : "On this device"}
      </strong>
    </div>
  );
}

export default function PlusDashboardPage() {
  const {
    user,
    isSignedIn,
    household,
    householdLoading,
  } = useAuth();

  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#household") {
      scrollToHousehold();
    }
  }, [location.hash]);

  function scrollToHousehold() {
    window.requestAnimationFrame(() => {
      document
        .getElementById("household")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  const shoppingSync =
    useShoppingSyncStatus();

  const weeklyPlanSync =
    useWeeklyPlanSyncStatus();

  const cookbookSync =
    useCookbookSyncStatus();

  return (
    <main className="sd-plus-page">
      <section className="sd-plus-hero">
        <span className="sd-plus-badge">
          Simple Dinners Plus
        </span>

        <h1>
          Shared planning for busy families.
        </h1>

        <p>
          Plan together, save recipes faster,
          and make the weekly dinner routine
          feel a little more simple.
        </p>
      </section>

      {isSignedIn && (
        <section className="sd-plus-section">
          <div className="sd-plus-section-heading">
            <div>
              <span>Your household</span>

              <h2>
                {householdLoading
                  ? "Loading…"
                  : household?.name ??
                  "Set up your household"}
              </h2>
            </div>

            {household && (
              <span className="sd-plus-role">
                {household.role === "owner"
                  ? "Owner"
                  : "Member"}
              </span>
            )}
          </div>

          <p className="sd-plus-account-email">
            {user?.email}
          </p>

          {household && (
            <div className="sd-plus-sync-card">
              <SyncItem
                label="Weekly Plan"
                status={weeklyPlanSync.status}
              />

              <SyncItem
                label="Shopping List"
                status={shoppingSync.status}
              />

              <SyncItem
                label="Cookbook"
                status={cookbookSync.status}
              />
            </div>
          )}
        </section>
      )}

      {!isSignedIn && (
        <section id="household"
          className="sd-plus-preview-card">
          <Users
            size={24}
            aria-hidden="true"
          />

          <div>
            <h2>Built for your household</h2>

            <p>
              Create an account when you are
              ready to share plans, lists, and
              saved recipes across devices.
            </p>
          </div>
        </section>
      )}

      <section id="household"
        className="sd-plus-section">
        <div className="sd-plus-section-heading">
          <div>
            <span>Included in Plus</span>
            <h2>Make dinner easier</h2>
          </div>
        </div>

        <div className="sd-plus-feature-grid">
          <FeatureCard
            title="Smart Week"
            description="Build a thoughtful week around your schedule, pantry, preferences, and requests."
            to="/smart-week"
            icon={CalendarDays}
            badge="AI"
          />

          <FeatureCard
            title="Smart Shopping"
            description="Turn your dinner plan into a cleaner, smarter grocery trip."
            to="/shopping-list"
            icon={ShoppingCart}
          />

          <FeatureCard
            title="Screenshot Import"
            description="Save recipes from screenshots and review everything before adding them."
            to="/cookbook"
            icon={Camera}
            badge="AI"
          />

          <FeatureCard
            title="Shared Cookbook"
            description="Keep your household’s saved recipes together and synced."
            to="/cookbook"
            icon={BookOpen}
          />

          <FeatureCard
            title="Shared Weekly Plan"
            description="Let everyone in the household see the same dinner plan."
            to="/week"
            icon={CalendarDays}
          />

          <FeatureCard
            title="Household Sharing"
            description="Keep planning, shopping, and recipes connected across your family."
            to="/plus#household"
            icon={Users}
            onClick={scrollToHousehold}
          />
        </div>
      </section>
    </main>
  );
}