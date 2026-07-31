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
4. [x] `eas build --platform android --profile production` — running:
       https://expo.dev/accounts/boaz65sa/projects/swipebid-app2/builds/14843119-105b-44ab-856c-3dae237fd88d
5. [x] `eas build --platform ios --profile production` — running (reused stored Apple
       distribution cert/provisioning profile, no fresh Apple login needed):
       https://expo.dev/accounts/boaz65sa/projects/swipebid-app2/builds/ae511904-8618-401a-aaee-31999390a95b
6. [ ] Pick up the Draft app in Play Console: check pricing (paid/free — the #1 gotcha from the
       bouzoukifret submission), fill content declarations, upload the AAB
7. [ ] `eas submit --platform ios` (or manual App Store Connect upload) — addresses the 3 fixed
       rejection reasons
8. [ ] Decide when to move Stripe from test → live key

## Notes
- `google-play-service-account.json` (needed for automated `eas submit --platform android`) is
  not present locally — either locate it, generate a new one via Google Cloud Console, or upload
  the AAB to Play Console manually instead.
- Apple Developer Program License Agreement had to be re-accepted by the user before App Store
  Connect / Certificates access worked again (blocking banner on developer.apple.com/account).
