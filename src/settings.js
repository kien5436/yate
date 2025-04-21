import { storage } from 'webextension-polyfill';

/**
 * @typedef {{
 *   autoSwapLanguages: boolean,
 *   darkTheme: boolean,
 *   keepHistory: boolean,
 *   shortcutPopup: string | null,
 *   shortcutSelectedText: string | null,
 *   shortcutTranslateFullPage: string | null,
 *   sourceLang: string,
 *   targetLang: string,
 *   translateWithButton: boolean
 * }} Settings
 *
 * @type {Settings}
 */
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

export async function getSettings() {
  try {
    const options = await storage.sync.get();

    return { ...defaultOptions, ...options };
  }
  catch (err) {
    console.error(err);

    return defaultOptions;
  }
}

export const extensionUrl = 'firefox' === ua() ? 'https://addons.mozilla.org/en-US/firefox/addon/yate/' : 'https://microsoftedge.microsoft.com/addons/detail/dimpiplalplpcfdkgjciifgjobpniofa';

function ua() {
  if (-1 !== navigator.userAgent.indexOf('Chrome'))
    return 'chromium';

  // FIREFOX
  if (-1 !== navigator.userAgent.indexOf('Firefox'))
    return 'firefox';

  // EDGE
  if (-1 !== navigator.userAgent.indexOf('Edge'))
    return 'edge';

  // SAFARI
  if (-1 !== navigator.userAgent.indexOf('Safari'))
    return 'safari';

  // OPERA
  if (-1 !== navigator.userAgent.indexOf('Opera'))
    return 'opera';

  // YANDEX BROWSER
  if (-1 !== navigator.userAgent.indexOf('YaBrowser'))
    return 'yandex';

  // OTHERS

  return 'others';

}
