export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem("sd-onboarding-complete") === "true";
}

export function completeOnboarding() {
  localStorage.setItem("sd-onboarding-complete", "true");
}