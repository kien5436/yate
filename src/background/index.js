import { runtime, storage } from 'webextension-polyfill';

import { connected, storageChanged } from './broadcast.js';
import createMenu from './context-menu.js';

runtime.onInstalled.addListener(() => runtime.openOptionsPage());

storage.onChanged.addListener(storageChanged);

runtime.onConnect.addListener(connected);

createMenu();
