# CEYNOA — Cloud Storage App (React Native / Expo)

Front-end mobile app built from the provided sketches. **Smart, Secure & Affordable Cloud Storage.**
Built with **Expo (SDK 51)** + **React Navigation**. Android-focused, with a light/dark theme toggle.

> ⚠️ **Unverified handoff code.** This was written as a clean, idiomatic front-end and has
> not been run on a device/emulator here. Run it yourself with the steps below and wire up a
> real backend where the mock data is referenced.

---

## Run it

```bash
# 1. install deps
npm install

# 2. start the dev server
npx expo start

# then press "a" to open on an Android emulator/device (Expo Go),
# or scan the QR code with the Expo Go app.
```

Requires Node 18+, the Expo CLI (bundled via `npx`), and Android Studio / an emulator or the
Expo Go app on a physical device.

---

## What's included (all screens from the sketch)

**Auth flow**
- `Splash` → animated brand intro
- `Onboarding` → Login / Create Account
- `Login` → email + password, keep-logged-in, Google
- `SignUp` → name, DOB, email, password, Google

**Main tabs** (custom dark floating tab bar + center Upload FAB)
- `Home` → storage overview gauge, quick actions, recent / shared files, notifications preview
- `Files` → search, filters, folders + files
- `Notifications` → typed notification cards
- `Profile` → profile card + menu, logout confirmation

**Pushed screens**
- `Folder` → folder contents (search, sub-folders, files, add new)
- `Upload` → file picker, destination folder dropdown, share + expiry
- `EditProfile` → name / phone / email / DOB
- `Subscription` → current plan gauge + Standard / Plus / Pro plans
- `Settings` → notification settings, password manager, dark mode, delete account
- `NotificationSettings` → six toggles
- `PasswordManager` → current / new / confirm password
- `PrivacyPolicy` → policy content
- `Support` → FAQ accordion + contact options
- `Clients` → searchable client list with unread badges
- `Chat` → message thread with composer

---

## Project structure

```
App.js                    # providers + navigation container + theming
app.json                  # Expo config (name, android package, splash)
src/
  theme/
    colors.js             # CEYNOA orange/amber tokens (light + dark palettes)
    ThemeContext.js       # theme provider, persists pref via AsyncStorage
  context/
    AuthContext.js        # mock auth state (signIn / signOut / updateUser)
  data/
    mock.js               # files, folders, clients, notifications, plans, FAQs
  components/             # BrandLogo, GradientHeader, Button, Input, Card,
                          # Rows, Avatar, StorageMeter, Toggle, SearchBar, CustomTabBar
  navigation/
    RootNavigator.js      # auth stack <-> main app stack (driven by auth state)
    MainTabs.js           # bottom tabs with the custom tab bar
  screens/                # one file per screen (auth/ holds the 4 auth screens)
```

## Theming

- All colors come from `src/theme/colors.js`. Change `accent.gradient` to re-brand.
- `useTheme()` returns `{ c, isDark, toggleTheme }`; `c` is the resolved palette.
- Theme preference is saved with AsyncStorage; default is **light** (matches the sketch).

## Notes & next steps for a real build

- **Backend:** screens read from `src/data/mock.js`. Replace those imports with API calls
  (the data shapes are intentionally simple to map onto a REST/GraphQL layer).
- **Auth:** `AuthContext` simulates sign-in with a timeout. Swap in your real auth provider.
- **Images:** avatars use `pravatar.cc`, the login backdrop uses an Unsplash URL, and file
  thumbnails are icons — replace with your own assets/CDN.
- **Fonts:** uses the platform default (Roboto on Android). To match the sketch exactly,
  add `expo-font` + the Inter family and set it as the default text style.
- **File picking / uploads:** the Upload screen is UI-only. Wire `expo-document-picker` /
  `expo-image-picker` and your storage API to make it functional.
```
