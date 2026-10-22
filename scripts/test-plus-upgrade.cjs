// Run with npm run test:plus. Native store and auth services are mocked.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const Module = require("node:module");
const root = path.resolve(__dirname, "..");
const req = Module.createRequire(root + "/package.json");
const React = req("react");
const ts = req("typescript");
const Renderer = req("react-test-renderer");
const { act } = Renderer;
global.window = {
  addEventListener() {},
  removeEventListener() {},
  requestAnimationFrame(fn) {
    fn();
  },
  scrollTo() {},
  setTimeout,
  clearTimeout,
  open() {},
};
global.document = {
  getElementById() {
    return null;
  },
};
function fixture({
  platform = "android",
  paid = false,
  signedIn = false,
  unavailable = false,
  household = false,
  language = "en",
} = {}) {
  let auth,
    sdkUser = null,
    configured = false,
    listener;
  const calls = [];
  const info = () => ({
    entitlements: {
      active: paid ? { "Simple Dinners Plus": { store: "PLAY_STORE" } } : {},
    },
    managementURL: paid
      ? "https://play.google.com/store/account/subscriptions"
      : null,
  });
  const pack = (id) => ({
    identifier: id,
    product: {
      identifier: id,
      priceString: id === "monthly" ? "£4.99" : "£34.99",
      pricePerMonthString: "£2.92",
      defaultOption: { freePhase: {} },
      introPrice: { price: 0 },
    },
  });
  const sdk = {
    isConfigured: async () => ({ isConfigured: configured }),
    configure: async (c) => {
      calls.push(["configure", c]);
      configured = true;
      sdkUser = c.appUserID || "$RCAnonymousID:test";
    },
    getAppUserID: async () => ({ appUserID: sdkUser }),
    isAnonymous: async () => ({
      isAnonymous: sdkUser?.startsWith("$RCAnonymousID:"),
    }),
    logIn: async ({ appUserID }) => {
      calls.push(["login", appUserID]);
      sdkUser = appUserID;
      return { customerInfo: info() };
    },
    logOut: async () => {
      calls.push(["logout"]);
      sdkUser = "$RCAnonymousID:next";
      return { customerInfo: info() };
    },
    setLogLevel: async () => {},
    getOfferings: async () => {
      calls.push(["offerings", sdkUser]);
      if (unavailable) throw Error("offline");
      return { current: { monthly: pack("monthly"), annual: pack("annual") } };
    },
    getCustomerInfo: async () => ({ customerInfo: info() }),
    addCustomerInfoUpdateListener: async (cb) => {
      listener = cb;
      return "listener";
    },
    removeCustomerInfoUpdateListener: async () => {},
    purchasePackage: async ({ aPackage }) => {
      calls.push(["purchase", sdkUser, aPackage.identifier]);
      paid = true;
      return { customerInfo: info() };
    },
    restorePurchases: async () => {
      calls.push(["restore", sdkUser]);
      return { customerInfo: info() };
    },
    checkTrialOrIntroductoryPriceEligibility: async () => ({
      monthly: { status: 1 },
      annual: { status: 1 },
    }),
  };
  const Auth = React.createContext(null);
  function AuthProvider({ children }) {
    const [user, setUser] = React.useState(
      signedIn ? { id: "user-a", email: "test@example.com" } : null,
    );
    auth = {
      user,
      loading: false,
      isSignedIn: !!user,
      isConfigured: true,
      household: null,
      householdId: null,
      householdLoading: false,
      needsHouseholdSetup: false,
      signIn: async () => {
        setUser({ id: "user-a", email: "test@example.com" });
        return { error: null };
      },
      signUp: async () => {
        setUser({ id: "user-a", email: "test@example.com" });
        return { error: null };
      },
      signOut: async () => {
        setUser(null);
        paid = false;
        return { error: null };
      },
      refreshHousehold: async () => {},
      switchUser: (id) => {
        paid = false;
        setUser(id ? { id, email: "test@example.com" } : null);
      },
    };
    return React.createElement(Auth.Provider, { value: auth }, children);
  }
  const mocks = {
    "@capacitor/core": {
      Capacitor: {
        isNativePlatform: () => platform !== "web",
        getPlatform: () => platform,
      },
    },
    "@revenuecat/purchases-capacitor": {
      Purchases: sdk,
      LOG_LEVEL: { DEBUG: "DEBUG" },
      INTRO_ELIGIBILITY_STATUS: { INTRO_ELIGIBILITY_STATUS_ELIGIBLE: 1 },
    },
    "react-router-dom": {
      useNavigate: () => (p) => calls.push(["navigate", p]),
      useLocation: () => ({ state: null, hash: "" }),
      Link: ({ children, ...props }) =>
        React.createElement("a", props, children),
    },
    "lucide-react": new Proxy({}, { get: () => () => null }),
    [root + "/src/auth/AuthContext.tsx"]: {
      useAuth: () => React.useContext(Auth),
    },
    [root + "/src/i18n/index.ts"]: { getStoredLanguage: () => language },
    [root + "/src/plus/householdPlus.ts"]: {
      getHouseholdPlusStatus: async () => ({
        data: { hasPlus: household, source: "household" },
        error: null,
      }),
    },
    [root + "/src/cloud/household.ts"]: {
      getHouseholdMembers: async () => ({ data: [], error: null }),
      regenerateHouseholdInviteCode: async () => ({ error: null }),
    },
  };
  const cache = new Map();
  function load(file) {
    if (mocks[file]) return mocks[file];
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const source = fs
      .readFileSync(file, "utf8")
      .replace(
        /import\.meta\.env\s*\.VITE_REVENUECAT_(IOS|ANDROID)_API_KEY/g,
        JSON.stringify("public-test-key"),
      )
      .replaceAll("import.meta.env.DEV", "false");
    const code = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const localRequire = (id) => {
      if (mocks[id]) return mocks[id];
      if (id.endsWith(".css")) return {};
      if (!id.startsWith(".")) return req(id);
      let p = path.resolve(path.dirname(file), id);
      p = [p, p + ".ts", p + ".tsx", p + "/index.ts"].find(
        (p) => fs.existsSync(p) && fs.statSync(p).isFile(),
      );
      if (!p) throw Error("Cannot resolve " + id + " from " + file);
      return load(p);
    };
    vm.runInThisContext("(function(require,module,exports){" + code + "\n})", {
      filename: file,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  const rc = load(root + "/src/plus/revenueCat.ts");
  const ctx = load(root + "/src/plus/PlusEntitlementContext.tsx");
  let state;
  function Probe() {
    state = ctx.usePlusEntitlement();
    return null;
  }
  const Page = load(root + "/src/pages/PlusDashboardPage.tsx").default;
  const Header = load(root + "/src/auth/AccountButton.tsx").AccountButton;
  let rendered;
  const mount = async () => {
    await act(async () => {
      rendered = Renderer.create(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(
            ctx.PlusEntitlementProvider,
            null,
            React.createElement(Probe),
            React.createElement(Header),
            React.createElement(Page),
          ),
        ),
      );
    });
  };
  const text = () => JSON.stringify(rendered.toJSON());
  const buttons = () => rendered.root.findAllByType("button");
  const click = async (predicate) => {
    const b = buttons().find(predicate);
    assert.ok(b, "button exists");
    await act(async () => {
      await b.props.onClick();
    });
  };
  return {
    rc,
    sdk,
    calls,
    mount,
    text,
    buttons,
    click,
    get state() {
      return state;
    },
    get auth() {
      return auth;
    },
    get sdkUser() {
      return sdkUser;
    },
    available: () => {
      unavailable = false;
    },
    unmount: async () => act(() => rendered.unmount()),
  };
}
(async () => {
  let f = fixture();
  await Promise.all([
    f.rc.configureRevenueCat(),
    f.rc.configureRevenueCat(),
    f.rc.configureRevenueCat("user-a"),
  ]);
  assert.equal(f.calls.filter((c) => c[0] === "configure").length, 1);
  assert.equal(f.sdkUser, "user-a");
  await f.rc.configureRevenueCat();
  assert.match(f.sdkUser, /^\$RCAnonymousID:/);
  assert.equal(f.calls.filter((c) => c[0] === "logout").length, 1);
  console.log("PASS serialized guest configuration, login and logout identity");
  f = fixture();
  await f.mount();
  assert.equal(f.state.monthlyPrice, "£4.99");
  assert.equal(f.state.annualPrice, "£34.99");
  assert.equal(f.state.hasPlus, false);
  assert.ok(
    f.text().indexOf("Simple Dinners Plus") <
      f.text().indexOf("The complete everyday foundation."),
  );
  await f.click((b) => b.props["aria-label"] === "Open Simple Dinners Plus");
  assert.ok(f.calls.some((c) => c[0] === "navigate" && c[1] === "/plus"));
  await f.click((b) =>
    String(b.props.className).includes("purchase-option is-annual"),
  );
  assert.ok(f.text().includes("sd-account-modal"));
  assert.equal(f.calls.filter((c) => c[0] === "purchase").length, 0);
  await act(async () => {
    await f.auth.signIn();
  });
  assert.ok(f.text().includes("Selected plan"));
  assert.ok(!f.text().includes("sd-account-modal"));
  assert.equal(f.calls.filter((c) => c[0] === "purchase").length, 0);
  assert.equal(
    f.buttons().find((b) => String(b.props.className).includes("is-annual"))
      .props["aria-pressed"],
    true,
  );
  await f.click((b) =>
    String(b.props.className).includes("purchase-option is-annual"),
  );
  assert.deepEqual(
    f.calls.find((c) => c[0] === "purchase"),
    ["purchase", "user-a", "annual"],
  );
  assert.equal(f.state.hasPlus, true);
  console.log(
    "PASS guest prices and Plus-first order; header opens offer; chosen plan survives sign-in; explicit purchase uses signed-in identity",
  );
  await act(async () => f.auth.switchUser("user-b"));
  assert.equal(f.state.hasPlus, false);
  assert.equal(f.sdkUser, "user-b");
  await act(async () => f.auth.signOut());
  assert.equal(f.state.hasPlus, false);
  assert.match(f.sdkUser, /^\$RCAnonymousID:/);
  console.log("PASS account switch and logout do not retain Plus access");
  await f.unmount();
  f = fixture({ unavailable: true });
  await f.mount();
  assert.ok(f.text().includes("Reload prices"));
  assert.ok(f.text().includes("Sign in or create account"));
  f.available();
  await f.click((b) => b.children.includes("Reload prices"));
  assert.equal(f.state.monthlyPrice, "£4.99");
  await f.unmount();
  console.log(
    "PASS store failure keeps sign-in action and retry recovers prices",
  );
  f = fixture({ platform: "web" });
  await f.mount();
  assert.ok(
    f.text().includes("available in the Simple Dinners iOS and Android apps"),
  );
  assert.equal(f.calls.length, 0);
  await f.unmount();
  console.log("PASS web offer visible without native SDK calls");
  f = fixture({ platform: "ios", language: "es" });
  await f.mount();
  assert.ok(f.text().includes("Prueba gratis de 7 días"));
  assert.ok(f.text().includes("Iniciar sesión o crear cuenta"));
  assert.equal(f.state.monthlyPrice, "£4.99");
  await f.unmount();
  console.log("PASS Spanish iOS guest offer and eligible trial terms");
  f = fixture({ paid: true, signedIn: true });
  await f.mount();
  assert.ok(f.text().includes("Your Plus subscription is active"));
  assert.ok(!f.text().includes("Selected plan"));
  await f.unmount();
  console.log("PASS existing paid subscriber management");
  f = fixture({ signedIn: true, household: true });
  await f.mount();
  assert.ok(f.text().includes("Plus is included through your household"));
  assert.equal(f.state.hasPlus, true);
  await f.unmount();
  console.log("PASS household subscriber access");
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
