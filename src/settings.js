import { storage } from "webextension-polyfill";

export const defaultOptions = {
  autoSwapLanguages: true,
  darkTheme: false,
  keepHistory: false,
  shortcutPopup: null,
  shortcutSelectedText: null,
  shortcutTranslateFullPage: null,
  sourceLang: 'auto',
  targetLang: 'vi',
  translateWithButton: true,
};

export default async function getSettings() {
  try {
    const options = await storage.sync.get();

    return { ...defaultOptions, ...options };
  }
  catch (err) {
    console.error('settings.js:16:', err);
    return defaultOptions;
  }
}