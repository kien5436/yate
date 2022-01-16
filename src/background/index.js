import { runtime, storage } from 'webextension-polyfill';

import { connected, doTTS, storageChanged } from './broadcast';
import createMenu from './context-menu';

runtime.onInstalled.addListener(() => runtime.openOptionsPage());

storage.onChanged.addListener(storageChanged);

runtime.onConnect.addListener(connected);

runtime.onMessage.addListener(doTTS);

createMenu();