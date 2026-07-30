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
1. [ ] `eas login` (user does this locally — password never passed through automation)
2. [ ] Get real `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` for `winrswipe-prod`,
       wire into `eas.json` → `build.production.env`
3. [ ] Set up a real demo/reviewer account, add it to App Store Connect → Sign-In Information
4. [ ] `eas build --platform android --profile production`
5. [ ] `eas build --platform ios --profile production`
6. [ ] Pick up the Draft app in Play Console: check pricing (paid/free — the #1 gotcha from the
       bouzoukifret submission), fill content declarations, upload the AAB
7. [ ] `eas submit --platform ios` (or manual App Store Connect upload) — addresses the 3 fixed
       rejection reasons
8. [ ] Decide when to move Stripe from test → live key

## Notes
- `google-play-service-account.json` (needed for automated `eas submit --platform android`) is
  not present locally — either locate it, generate a new one via Google Cloud Console, or upload
  the AAB to Play Console manually instead.
