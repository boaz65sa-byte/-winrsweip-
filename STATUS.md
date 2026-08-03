# SwipeBid (WinrSwipe) — Submission Status

**Last updated:** 2026-07-30

## What this project is
Expo/React Native marketplace app — "Tinder-style auctions" for Israel. Stripe payments (escrow),
Supabase backend, admin web dashboard (`web/`). Package/bundle managed via EAS.

## Where things stood before this pass
- 2026-07-13: submitted to Apple App Store, **rejected** for 3 reasons:
  - Guideline 4.8 (Login Services) — needed Sign in with Apple alongside Google
  - Guideline 1.5 (Developer Info) — Support URL had no real content
  - Guideline 2.1(a) (App Completeness) — reviewer hit a login error; most likely cause is
    missing `EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY` in the EAS `production` build profile
    (confirmed: `eas.json`'s `build.production.env` only lists the Stripe key), and/or no
    working demo account configured in App Store Connect's Sign-In Information.
- Same day, commit `38c0496` fixed the code side of all 3 issues (Apple Sign-In, real support
  page, explicit startup error instead of silent undefined Supabase client).
- **No commits since 2026-07-13.** The fix was written but never actually rebuilt/resubmitted.
- Also found: a Draft app named "WinrSwipe" already exists in Google Play Console (created
  2026-03-30), never carried past Draft.
- Stripe key in the `production` EAS profile is still a **test** key (`pk_test_...`) — real
  payments won't work until a live Stripe account is linked.

## Plan to finish (no Mac required — EAS Build compiles iOS in the cloud)
1. [x] `eas login` — authenticated as `boaz65sa`
2. [x] Got real `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` for `winrswipe-prod`
       (project was paused on the free tier, not deleted — restored it), wired into all three
       `eas.json` build profiles, committed
3. [x] Demo/reviewer account created and verified working end-to-end:
       `appreview@bs-simple.com` / `Boaz6565` (had to also flip Email provider on in
       Supabase Auth settings — it was disabled project-wide). Confirmed via a direct
       `POST /auth/v1/token?grant_type=password` call, got a real access token back.
   - [ ] Still needs to be entered into App Store Connect → Sign-In Information (user action,
         domain is blocked for my browser tools — same restriction hit with Facebook earlier)
4. [x] Android production build **finished successfully**:
       https://expo.dev/accounts/boaz65sa/projects/swipebid-app2/builds/14843119-105b-44ab-856c-3dae237fd88d
       AAB: https://expo.dev/artifacts/eas/UhLJDNqoX9mczSSu4Lzfk4DUJ2hkJN5uKCWH2rTUhMo.aab
5. [x] iOS production build — first two attempts (`ae511904`, `b290fcef`) failed with
       `XCODE_BUILD_ERROR`: the stored provisioning profile (from March, before Apple Sign-In
       was added) didn't include the `com.apple.developer.applesignin` entitlement. Fixed by
       enabling "Sign In with Apple" under the App ID's Capabilities in Apple Developer Portal
       (developer.apple.com → Identifiers → com.winrswipe.app) — EAS then auto-detected the old
       profile was invalid and generated a fresh one (`QG96YK6WYS`). Rebuild (`60c67243`) is
       running: https://expo.dev/accounts/boaz65sa/projects/swipebid-app2/builds/60c67243-878d-48f1-97e9-303662726053
6. [x] Play Console content declarations — **all complete** (2026-08-02):
       - Privacy policy, ads (none), app access, content rating (IARC), target audience: done
         in an earlier pass.
       - Data Safety section: filled all 13 data types collected (personal info, financial info,
         location, photos, in-app messages, device/other IDs), each with collection/ephemeral/
         required-optional/purpose answers reflecting real app behavior (escrow marketplace with
         chat, product photos, and location-based nearby-auction discovery). Saved and finalized
         at the Preview step.
       - Advertising ID: No (no ad SDK).
       - Government apps: No.
       - Financial features: **Yes** — checked "Payments via mobile device and digital wallets"
         (Stripe-based buyer/seller escrow payments are real, so this wasn't a blanket "none of
         the above" like the other simple apps on this account).
       - Health apps: None of the above.
       - Play Console app-content overview now shows 0 items requiring attention.
       - Still need to pick pricing (paid/free) and actually upload the AAB to a release track —
         not yet done.
7. [~] Pick up the Draft app's release track:
       - [x] Pricing confirmed Free (no paid/free gotcha here).
       - [x] Internal testing track: first upload attempt (v3 AAB) rejected — "version code 3
             already used" (leftover from the original March draft app). Bumped
             `app.json`'s `android.versionCode` to 5; EAS auto-incremented to 6 on rebuild.
       - [x] New build finished: version code 6,
             https://expo.dev/accounts/boaz65sa/projects/swipebid-app2/builds/735a30c9-981b-4e9d-8224-ec68d287b980
             AAB downloaded to `build-artifacts/winrswipe-v6-release.aab` (85.6MB — over the
             browser tool's 10MB upload cap, so the user uploads it manually each time).
       - [x] User uploaded v6 AAB. First attempt bundled v3+v6 together in one release
             (both got added before v3 was removed) — removed the stale v3 bundle via the
             file's "⋮" menu → "הסרה של App Bundle" before continuing.
       - [x] Fixed the auto-filled release name (was still showing "3", updated to "6").
       - [x] Release notes (Hebrew) filled in.
       - [x] Published (2026-08-02, user confirmed before the publish click) — track status
             is now Active, version 6 (1.0.0) live to Internal Testing.
       - [x] Enabled the existing "בודקים ראשוניים" (initial testers) list (4 users) for this
             track — was present but not yet turned on for Internal Testing.
   **Android is done** for this pass: content declarations complete, pricing confirmed free,
   AAB (v6) live on Internal Testing with 4 testers assigned.
8. [x] `eas submit --platform ios` — succeeded on the second attempt:
       - First try (build #4, the original build from this pass) failed with a generic
         "Something went wrong when submitting your app to Apple App Store Connect" — no
         further detail available (App Store Connect is domain-blocked for my browser tools,
         and `eas submission:view` isn't a real command). Given the identical symptom just
         hit on Android (silent reuse of an already-used version identifier), the working
         theory is build number 4 was already consumed by an earlier attempt.
       - Fix: bumped `app.json`'s `ios.buildNumber` (4 → 6 → auto-incremented to 7 by EAS on
         rebuild), same pattern as the Android versionCode fix. Also had to add
         `submit.production.ios.ascAppId: "6760982270"` to `eas.json` — submit was failing
         immediately without it ("Set ascAppId in the submit profile").
       - New build (#7): https://expo.dev/accounts/boaz65sa/projects/swipebid-app2/builds/f799817f-4072-4ba1-a0f3-510cdbf7aa22
       - Submission succeeded: uploaded to App Store Connect, now Apple-side processing
         (~5-10 min). TestFlight: https://appstoreconnect.apple.com/apps/6760982270/testflight/ios
       - [x] Build #7 processed by Apple, user attached it to the previously-rejected 1.0
             submission in App Store Connect, selected it in "Add Build", and clicked
             Submit for Review. **Confirmed submitted (2026-08-03).**

## Final status (2026-08-03)
- **Android**: v6 live on Internal Testing, content declarations complete, pricing free.
- **iOS**: build #7 submitted for App Review with all 4 rejection reasons addressed:
  1. Guideline 4.8 (Login) — Sign in with Apple
  2. Guideline 5.1.1(v) (Privacy/phone) — phone marked optional in `app/login.tsx`
  3. Guideline 2.1(a) (App Completeness) — Supabase env vars fixed
  4. Guideline 1.5 (Support URL) — Vercel Authentication wall disabled + redeployed from the
     correct `web/` subdirectory; verified `/support` and `/privacy` return 200 via curl.
- Cross-account testers: shared "בודקים ראשוניים" email list (used by WinrSwipe, bouzoukifret,
  and laeloy) grown to 10 addresses at the user's request. Opt-in link for bouzoukifret verified
  working: `https://play.google.com/apps/testing/app.vercel.bouzoukifret.twa`.
- Stripe still on a test key — deferred, no user decision yet.

## New findings from the resend rejection email (2026-08-02)
User pasted Apple's "still needs attention" email for the **original** rejected submission
(92628e90-730c-4e44-aaaa-7657a1ac0dfd, reviewed 2026-08-01, version "1.0 (13)" — an older
build number than anything in this repo's `app.json` history, so this refers to whatever was
submitted before this pass, likely via Xcode/Transporter directly). Four issues listed:

1. **Guideline 4.8 (Login Services)** — same as before, addressed by the Apple Sign-In work.
2. **Guideline 5.1.1(v) (Privacy) — NEW, not previously known**: phone number required but not
   core to the app. Root cause: `app/login.tsx`'s registration form showed the phone field with
   no "optional" indication (even though nothing in code or the DB schema actually enforces it —
   `supabase/migrations/001_initial_schema.sql` has `phone TEXT` with no NOT NULL). Fixed by
   adding "(לא חובה)" to the placeholder text. Commit 4b501cb.
3. **Guideline 2.1(a) (App Completeness)** — same as before, addressed by the env var fix.
4. **Guideline 1.5 (Support URL)** — **still actually broken right now**, confirmed by curl:
   both `https://winrsweip-boaz-s-projects-6bda35e8.vercel.app` and its `/support` subpage
   return `302` redirects to `vercel.com/sso-api` (Vercel's deployment-protection wall), so
   Apple's reviewer genuinely can't reach it. This is NOT a stale/already-fixed complaint —
   it's a live bug.
   - Diagnosed via `vercel project protection --json` (shows `ssoProtection: null`, so it's not
     the per-project SSO toggle) and `vercel inspect <url>` (deployment is "Ready", aliases
     include both `winrsweip.vercel.app` — which 404s, wrong/different project — and the
     `-boaz-s-projects-6bda35e8` one — which is the one actually serving our content, but
     behind the wall). This looks like Vercel's automatic "Vercel Authentication" /
     Deployment Protection feature for auto-generated `*.vercel.app` URLs, which isn't exposed
     by the `vercel project protection` CLI subcommand (that only covers SSO/password/git-fork/
     skew) — couldn't fix or fully diagnose via CLI.
   - **RESOLVED (2026-08-03).** vercel.com is domain-blocked for my browser tools, so the user
     opened the dashboard themselves — found Settings → Deployment Protection → "Vercel
     Authentication" → "Require Log In" was ON, turned it off, saved.
   - That alone still 404'd though — a **second, independent bug**: the `-winrsweip-` Vercel
     project's Root Directory was set to `.` (repo root) instead of `web/` (where the actual
     Next.js app lives — confirmed via `web/package.json` name `winrswipe-web`), so production
     was serving an empty/wrong build. `vercel project update` doesn't expose a Root Directory
     flag, so fixed by linking and deploying directly from `web/` instead:
     `cd web && npx vercel link --yes --project="-winrsweip-" && npx vercel --prod --yes`
     — this deploy actually built `/support` and `/privacy` routes and got aliased to
     `winrsweip-boaz-s-projects-6bda35e8.vercel.app`.
   - Verified both now return `200 OK` via curl. Support/Privacy URLs are genuinely fixed.
9. [ ] Decide when to move Stripe from test → live key

## Notes
- `google-play-service-account.json` (needed for automated `eas submit --platform android`) is
  not present locally — either locate it, generate a new one via Google Cloud Console, or upload
  the AAB to Play Console manually instead.
- Apple Developer Program License Agreement had to be re-accepted by the user before App Store
  Connect / Certificates access worked again (blocking banner on developer.apple.com/account).
