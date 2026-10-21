# Sign in with Apple — Supabase dashboard check (needs dr eggbot / Boaz approval)

Project: `xkydgfjiofsdqsbozuha`. Nothing here was changed from the repo.

Read-only check on 21.10.2026: `GET /auth/v1/settings` reports `external.apple: true`,
so the Apple provider is already **enabled**. What the public settings endpoint cannot show
is the Client IDs list, which must contain the iOS bundle ID.

1. Open https://supabase.com/dashboard/project/xkydgfjiofsdqsbozuha/auth/providers → Apple.
2. Confirm **Enable Sign in with Apple** is on.
3. **Client IDs** must include exactly `com.winrswipe.app` (the `aud` of the native identity token).
   Add it if missing (comma separated). Do not remove other IDs without checking.
4. Secret Key (for OAuth) can stay empty: the native flow (`signInWithIdToken`) does not use it.
5. Save only if you changed something.
6. Apple Developer → Identifiers → `com.winrswipe.app` → Sign In with Apple capability is checked.

Test (WS-02): on a real iPhone with the 1.0.1 TestFlight build, tap Sign in with Apple with a new
Apple ID. Expected: you land on the feed. "Unsupported provider" means step 2 is off; an
"audience" / "Bad ID token" error means step 3 is missing `com.winrswipe.app`.
