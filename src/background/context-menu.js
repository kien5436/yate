import { tabs as browserTabs, contextMenus, i18n } from 'webextension-polyfill';
import { openInGoogleTranslate } from './api';

export default function createMenu() {

  contextMenus.create({
    id: 'translateFullPage',
    title: i18n.getMessage('translateFullPage'),
  });

  contextMenus.create({
    contexts: ['selection'],
    id: 'translateSelectedText',
    title: i18n.getMessage('translateSelectedText'),
  });

  contextMenus.onClicked.addListener(onClick);
}

/**
 * @param {import("webextension-polyfill").Menus.OnClickData} param0
 * @param {import("webextension-polyfill").Tabs.Tab} param1
 */
function onClick({ menuItemId }, { id, url }) {

  if ('translateFullPage' === menuItemId) {
    openInGoogleTranslate(url);
  }
  else if ('translateSelectedText' === menuItemId) {
    browserTabs.sendMessage(id, { action: 'showTranslationPanel' });
  }
}