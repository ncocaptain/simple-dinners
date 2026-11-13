# Simple Dinners — Agent Instructions

These instructions apply to Codex and any automated coding agent working in this repository.

## Product and architecture

Simple Dinners is a React + Vite + TypeScript app packaged with Capacitor for Android and iOS. It includes native integrations, Supabase-backed Plus/household features, recipe import/parsing, shopping-list generation, pantry logic, Smart Week planning, nutrition tooling, retailer fulfillment handoffs, and App Store / Play Store release configuration.

Treat this as a production app with live users. Preserve current behavior unless the task explicitly requires a change.

## Workflow rules

- Never work directly on `main`. Create a focused feature/fix branch.
- Never merge to `main`, deploy, publish, submit store builds, push database migrations, or modify production services without explicit human approval.
- Do not create or change releases, tags, store versions/build numbers, signing settings, provisioning profiles, secrets, API keys, or environment values unless explicitly requested.
- Do not push commits merely to checkpoint progress. Batch coherent changes so preview deployments are not spammed.
- Do not rewrite unrelated code, reformat large files, rename things broadly, or perform opportunistic cleanup.
- Preserve unrelated local/untracked files and existing user changes.
- Never run destructive Git commands such as `git reset --hard`, `git clean -fd`, or force pushes.
- Never run `npm audit fix --force` as part of feature work.
- If a task reveals an unrelated issue, report it separately instead of folding it into the current change.

## Repository safety

Before changing code:

1. Read the relevant implementation and trace the full data path.
2. Check for existing helpers, tests, scripts, and platform-specific behavior.
3. Identify whether the change affects web, Android, iOS, Supabase, RevenueCat, Vercel/serverless APIs, or more than one layer.
4. Keep the smallest safe scope that solves the requested problem.

This repository contains some historical stray root-level files from prior shell mistakes. Do not delete or modify unrelated root files unless a human explicitly assigns cleanup.

## Fragile / high-impact areas

Changes in these areas require extra care and end-to-end tracing:

- recipe parsing and import normalization
- URL, share-sheet, screenshot, video, and social imports
- ingredient identity/normalization
- shopping-list generation, quantity handling, hidden/staple logic, pantry matching
- fulfillment and retailer handoffs
- Pantry and freshness / Use Soon behavior
- Smart Week constraints, repeat avoidance, favorites, and cook history
- household sync and Supabase data flow
- auth, Plus access, RevenueCat identity, trials, and biometric sign-in
- nutrition parsing/calculation
- recipe data and built-in categories
- iOS share extension and native Capacitor plugins
- Android/iOS versioning, native manifests/plists, signing, and store configuration

For these areas, do not patch only the visible UI symptom. Follow the data from source/input through normalization/storage/sync to final UI/output.

## Product principles

- Core meal planning remains free; Plus should add convenience, automation, sync, or advanced assistance rather than blocking basic usefulness.
- Security and account-access conveniences should not be gated behind Plus unless explicitly directed.
- Prefer the wording **Save Recipe** where applicable.
- Preserve the current Simple Dinners design language and interaction patterns unless a redesign is part of the task.
- Avoid adding complexity to the shopping experience when one generalized integration can replace many retailer-specific paths.
- Do not expose measurements directly on the main Shopping List when the existing UX intentionally keeps quantity details behind interaction.

## Validation

For ordinary TypeScript/UI work, run at minimum:

```bash
npm install
npm run build
```

When relevant, also run:

```bash
npm run lint
npm run validate:recipes
npm run audit:shopping
npm run test:plus
```

Use judgment: some audit scripts are diagnostic and may surface known data issues. Report their output clearly; do not silently "fix" broad datasets just to make an audit prettier.

For Android-impacting changes, after the web build is green:

```bash
npx cap sync android
```

For iOS-impacting changes, after the web build is green:

```bash
npx cap sync ios
```

Native sync is not a substitute for a real-device test when the feature depends on native hardware or OS behavior (for example biometrics, share extensions, purchases, or platform-specific permissions).

## Known lint baseline

The repository currently has 7 known `react-hooks/exhaustive-deps` warnings and 0 lint errors. These warnings are behavior-sensitive and should not be auto-fixed as part of unrelated work.

- Do not introduce new lint errors.
- Do not increase the warning count without explicitly documenting why.
- Only change the existing hook dependency warnings in a dedicated, tested task.

## Release discipline

A feature is not release-ready merely because TypeScript compiles.

Before calling a change production-ready:

- build must pass
- relevant audits/tests must pass or known failures must be documented
- native sync must complete for affected platforms
- native behavior must be manually verified when applicable
- the human owner must explicitly approve merge/release

Do not bump versions/build numbers unless the task is specifically a release task.

## Supabase and production data

- Do not run migrations against production or mutate live user data without explicit approval.
- Prefer local/static reasoning and code changes first.
- When schema or sync logic changes are necessary, document migration impact and rollback considerations.
- Never print, commit, or expose secrets.

## Completion report

When finishing a task, report:

- branch name
- files changed
- user-visible behavior changed
- validation commands run and results
- anything not validated
- any follow-up risks or manual checks required

Do not claim a task is merged, deployed, live, or store-approved unless that action actually occurred and was verified.
