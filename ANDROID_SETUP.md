# Capacitor + FCM Setup

## Install
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/push-notifications

## Init Android platform
npx cap add android
npx cap sync android

## Build web and sync
npm run build
npx cap copy android

## Open Android Studio
npx cap open android

## FCM Android
1. Add `google-services.json` into `android/app/`.
2. Configure Firebase project package `com.yarakids.app`.
3. Build APK/AAB from Android Studio.

## Icon Sync Rule
- Browser/PWA icons update from admin logo + iconVersion.
- APK icon updates on new Android build release.
