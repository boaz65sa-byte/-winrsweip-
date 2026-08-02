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
7. [ ] Pick up the Draft app's release track: check pricing (paid/free — the #1 gotcha from the
       bouzoukifret submission), upload the AAB
       (https://expo.dev/artifacts/eas/UhLJDNqoX9mczSSu4Lzfk4DUJ2hkJN5uKCWH2rTUhMo.aab)
8. [ ] `eas submit --platform ios` (or manual App Store Connect upload) — addresses the 3 fixed
       rejection reasons
9. [ ] Decide when to move Stripe from test → live key

## Notes
- `google-play-service-account.json` (needed for automated `eas submit --platform android`) is
  not present locally — either locate it, generate a new one via Google Cloud Console, or upload
  the AAB to Play Console manually instead.
- Apple Developer Program License Agreement had to be re-accepted by the user before App Store
  Connect / Certificates access worked again (blocking banner on developer.apple.com/account).
