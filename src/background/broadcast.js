import { i18n, tabs } from 'webextension-polyfill';

import { translate, tts } from './api';
import AudioPlayer from './audio';

const audio = new AudioPlayer();

/**
 * @param {{[key: string]: import('webextension-polyfill').Storage.StorageChange}} changes
 * @param {"sync" | "local"} area
 */
export async function storageChanged(changes, area) {

  if ('sync' === area) {

    const options = {};

    for (const key in changes) {
      if (changes.hasOwnProperty(key)) {
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

  port.onMessage.addListener(doTranslate);
}

/**
 * @param {{
 *  text: string;
 *  sourceLang: string;
 *  targetLang: string;
 * }} message
 * @param {import('webextension-polyfill').Runtime.Port} port
 */
async function doTranslate(message, port) {

  try {
    const translation = await translate(message.text, message.sourceLang, message.targetLang);
    port.postMessage({ key: message.text + message.sourceLang + message.targetLang, translation });
  }
  catch (err) {
    console.error('broadcast.js:45:', err);
    port.postMessage({ error: i18n.getMessage('serviceUnavailable') });
  }
}

export async function doTTS(message) {

  try {
    audio.src = await tts(message.text, message.targetLang);
    audio.play();
  }
  catch (err) {
    console.error('broadcast.js:80', err);
  }
}