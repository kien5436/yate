import { storage } from "webextension-polyfill";

export const defaultOptions = {
  autoSwapLanguages: false,
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

export const extensionUrl = 'firefox' === ua() ? 'https://addons.mozilla.org/en-US/firefox/addon/yate/' : 'https://microsoftedge.microsoft.com/addons/detail/dimpiplalplpcfdkgjciifgjobpniofa';

function ua() {
  if (-1 !== navigator.userAgent.indexOf("Chrome")) {
    return 'chromium';
  }
  // FIREFOX
  else if (-1 !== navigator.userAgent.indexOf("Firefox")) {
    return 'firefox';
  }
  // EDGE
  else if (-1 !== navigator.userAgent.indexOf("Edge")) {
    return 'edge';
  }
  // SAFARI
  else if (-1 !== navigator.userAgent.indexOf("Safari")) {
    return 'safari';
  }
  // OPERA
  else if (-1 !== navigator.userAgent.indexOf("Opera")) {
    return 'opera';
  }
  // YANDEX BROWSER
  else if (-1 !== navigator.userAgent.indexOf("YaBrowser")) {
    return 'yandex';
  }
  // OTHERS

  return 'others';

}