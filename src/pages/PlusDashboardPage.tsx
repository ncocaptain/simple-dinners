import {
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Copy,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
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
import {
  getHouseholdMembers,
  type HouseholdMember,
} from "../cloud/household";

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

  const [
    householdMembers,
    setHouseholdMembers,
  ] = useState<HouseholdMember[]>([]);

  const [
    householdMembersLoading,
    setHouseholdMembersLoading,
  ] = useState(false);

  const [
    householdMembersError,
    setHouseholdMembersError,
  ] = useState<string | null>(null);

  const [inviteCodeCopied, setInviteCodeCopied] =
    useState(false);

  const [inviteCodeError, setInviteCodeError] =
    useState<string | null>(null);

  async function handleCopyInviteCode() {
    if (!household?.inviteCode) {
      return;
    }

    setInviteCodeCopied(false);
    setInviteCodeError(null);

    try {
      await navigator.clipboard.writeText(
        household.inviteCode,
      );

      setInviteCodeCopied(true);

      window.setTimeout(() => {
        setInviteCodeCopied(false);
      }, 2500);
    } catch {
      const textarea =
        document.createElement("textarea");

      textarea.value = household.inviteCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const copied =
        document.execCommand("copy");

      document.body.removeChild(textarea);

      if (copied) {
        setInviteCodeCopied(true);

        window.setTimeout(() => {
          setInviteCodeCopied(false);
        }, 2500);
      } else {
        setInviteCodeError(
          "Unable to copy the household code.",
        );
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (!isSignedIn || !household?.id) {
      setHouseholdMembers([]);
      setHouseholdMembersError(null);
      setHouseholdMembersLoading(false);
      return;
    }

    async function loadMembers() {
      setHouseholdMembersLoading(true);
      setHouseholdMembersError(null);

      const result =
        await getHouseholdMembers();

      if (cancelled) {
        return;
      }

      if (result.error) {
        setHouseholdMembers([]);
        setHouseholdMembersError(
          result.error,
        );
      } else {
        setHouseholdMembers(
          result.data ?? [],
        );
      }

      setHouseholdMembersLoading(false);
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [
    household?.id,
    isSignedIn,
  ]);

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

          <div className="sd-plus-members-card">
            <div className="sd-plus-members-heading">
              <div>
                <span>Household members</span>

                <h3>
                  {householdMembers.length}{" "}
                  {householdMembers.length === 1
                    ? "member"
                    : "members"}
                </h3>
              </div>

              <Users
                size={21}
                aria-hidden="true"
              />
            </div>

            {householdMembersLoading ? (
              <p className="sd-plus-members-message">
                Loading household members…
              </p>
            ) : householdMembersError ? (
              <p className="sd-plus-members-message is-error">
                Unable to load household members.
              </p>
            ) : (
              <div className="sd-plus-members-list">
                {householdMembers.map((member) => {
                  const memberName =
                    member.displayName?.trim() ||
                    member.email ||
                    "Household member";

                  const initial =
                    memberName
                      .charAt(0)
                      .toUpperCase() || "?";

                  return (
                    <div
                      key={member.userId}
                      className="sd-plus-member-row"
                    >
                      <div
                        className="sd-plus-member-avatar"
                        aria-hidden="true"
                      >
                        {initial}
                      </div>

                      <div className="sd-plus-member-copy">
                        <strong>
                          {memberName}

                          {member.isCurrentUser && (
                            <span> You</span>
                          )}
                        </strong>

                        {member.displayName &&
                          member.email && (
                            <p>{member.email}</p>
                          )}
                      </div>

                      <span className="sd-plus-member-role">
                        {member.role === "owner"
                          ? "Owner"
                          : "Member"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {household?.role === "owner" &&
            household.inviteCode && (
              <div className="sd-plus-invite-card">
                <div className="sd-plus-invite-icon">
                  <Users
                    size={22}
                    aria-hidden="true"
                  />
                </div>

                <div className="sd-plus-invite-copy">
                  <span>Invite someone</span>

                  <h3>
                    Share your household code
                  </h3>

                  <p>
                    Send this code privately to
                    someone you want to plan, shop,
                    and save recipes with.
                  </p>

                  <div className="sd-plus-invite-code-row">
                    <code>
                      {household.inviteCode}
                    </code>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyInviteCode()
                      }
                    >
                      {inviteCodeCopied ? (
                        <CheckCircle2
                          size={16}
                          aria-hidden="true"
                        />
                      ) : (
                        <Copy
                          size={16}
                          aria-hidden="true"
                        />
                      )}

                      {inviteCodeCopied
                        ? "Copied"
                        : "Copy code"}
                    </button>
                  </div>

                  {inviteCodeError && (
                    <p className="sd-plus-invite-error">
                      {inviteCodeError}
                    </p>
                  )}
                </div>
              </div>
            )}
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