import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ncocaptain.simpledinners",
  appName: "Simple Dinners",
  webDir: "dist",
  // Add this 'server' block right here:
  server: {
    androidScheme: "https",
    allowNavigation: ["dinners.ncocaptain.com"]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#4E6E8E",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;