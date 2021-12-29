import { runtime, tabs } from 'webextension-polyfill';

import createMenu from './context-menu';

runtime.onInstalled.addListener(() => {

  tabs.create({ url: runtime.getURL('options.html') });
});

createMenu();