import { tabs } from 'webextension-polyfill';

import { translate } from './api';

/**
 * @param {{[key: string]: import('webextension-polyfill').Storage.StorageChange}} changes
 * @param {"sync" | "local"} area
 */
export async function storageChanged(changes, area) {

  if ('sync' === area) {

    const options = {};

    for (const key in changes) {
      if (changes.hasOwnProperty( key)) {
        options[key] = changes[key].newValue;
      }
    }

    try {
      const tabList = await tabs.query({ currentWindow: true });
      const messageQueue = [];

      for (const tab of tabList) {

        if (tab.url.startsWith('http:') || tab.url.startsWith('https:')) {
          messageQueue.push(tabs.sendMessage(tab.id, { options }));
        }
      }

      await Promise.all(messageQueue);
    }
    catch (err) {
      console.error('index.js:18:', err);
    }
  }
}

/** @param {import('webextension-polyfill').Runtime.Port} port */
export function connected(port) {

  port.onMessage.addListener(onMessage);
}

/**
 * @param {{action: 'translate' | 'pronounce'; text: string}} message
 * @param {import('webextension-polyfill').Runtime.Port} port
 */
async function onMessage(message, port) {

  if ('translate' === message.action) {

    try {
      const translation = await translate(message.text);
      port.postMessage({ action: message.action, translation });
    }
    catch (err) {
      console.error('broadcast.js:45:', err);
      port.postMessage({ action: message.action, error: err });
    }
  }
}