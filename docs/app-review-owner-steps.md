# WinrSwipe — owner steps before the next iOS review

The app code on this branch is ready for a new iOS build. These steps cannot be finished from the repo.

## 1. Turn on Sign in with Apple in Supabase

The native button is already in the app. Auth settings on project `xkydgfjiofsdqsbozuha` currently report `apple: false`, so the button fails after Apple’s sheet until this is saved.

1. Open https://supabase.com/dashboard/project/xkydgfjiofsdqsbozuha/auth/providers
2. Apple → Enable.
3. Client IDs: `com.winrswipe.app`
   That value is the iOS bundle ID. Apple puts it in the identity token `aud` claim. Supabase rejects the token if it is not listed.
4. Save.

Native Sign in with Apple does not need a Services ID, a website return URL, or the six-month OAuth secret. Those are only for a browser OAuth flow. Do not add `host.exp.Exponent` unless you also test inside Expo Go.

Confirm the App ID `com.winrswipe.app` still has the Sign in with Apple capability in the Apple Developer portal (Identifiers). EAS already built with that entitlement once.

## 2. Deploy the account-deletion function

The profile screen calls the Edge Function `delete-account`. It checks the caller’s JWT and deletes that user with the service role: listings, bids, messages, stored photos, the `public.users` row, and the Auth user. Then the app signs out.

The function is already deployed on project `xkydgfjiofsdqsbozuha` (`delete-account`, JWT required). Redeploy only if you change it:

```bash
npx supabase functions deploy delete-account --project-ref xkydgfjiofsdqsbozuha
```

`verify_jwt` stays on. Do not put the service role key in the app.

If you redeploy `create-payment-intent`, leave the Supabase secret `PAYMENTS_ENABLED` unset. The function returns 403 until that secret is the string `true`.

## 3. Republish the support site

App Review opens these URLs:

- Support: https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/support
- Privacy: https://winrsweip-boaz-s-projects-6bda35e8.vercel.app/privacy

The pages in `web/` match the free app (in-app deletion, no checkout). A push to `main` builds that Next.js app: the repo-root `vercel.json` runs `@vercel/next` on `web/package.json`. Both Vercel projects (`-winrsweip-` and `winrsweip`, team `boaz-s-projects-6bda35e8`) must keep Root Directory as the repository root so that file is used. If Root Directory is `web`, this root file is ignored and `web/vercel.json` (framework `nextjs`, no output directory) is the config instead.

Do not publish production with a one-off `vercel --prod` from `web/` while Git is also connected. The next push to `main` replaces that alias.

## 4. EAS build (do not submit from here)

`app.json` `ios.buildNumber` is `25`, which is higher than rejected build 24. The production profile has `autoIncrement`, so the binary EAS compiles will be **26**.

```bash
npx eas-cli build --platform ios --profile production
```

Do not run `eas submit` until you have checked the build yourself. Also run `eas env:list` and delete any dashboard `EXPO_PUBLIC_SUPABASE_*` value that is not `https://xkydgfjiofsdqsbozuha.supabase.co`. Dashboard env overrides `eas.json`. There should be no `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` on the build while payments are off.

## 5. App Store Connect fields

Copy `app-store-listing.txt`.

- Name: WinrSwipe
- Subtitle: Swipe through local deals
- Support URL and Privacy Policy URL: the two links above
- Sign-in required: yes
- User name: `appreview@bs-simple.com`
- Password: the password already used for that account. Type it only in App Store Connect. It is not stored in this repo.
- Paste the English review notes from `app-store-listing.txt`.

Attach the new build. Do not reuse build 24.

## 6. Turning payments on later

1. Set `PAYMENTS_ENABLED` to `true` in `lib/features.ts`.
2. Put a live publishable key in the EAS profile as `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Set Supabase secrets `PAYMENTS_ENABLED=true` and `STRIPE_SECRET_KEY` to the live secret.
4. Ship a new build. Checkout, fees, and the paid terms section come back from that one flag.
