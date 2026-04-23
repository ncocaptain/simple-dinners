import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ncocaptain.simpledinners",
  appName: "Simple Dinners",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true
  },
  plugins: {
  SplashScreen: {
    launchShowDuration: 1500,
    launchAutoHide: true,
    backgroundColor: "#1e88e5",
    androidScaleType: "CENTER_INSIDE",
    showSpinner: false
  }
}
};

export default config;