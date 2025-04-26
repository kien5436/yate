/* eslint-disable no-await-in-loop */
import { i18n, tabs } from 'webextension-polyfill';

import { ERROR_BLOCKED_BY_SERVER, MAX_TEXT_LEN, translate, tts } from './api.js';
import AudioPlayer from './audio.js';

const audio = new AudioPlayer();

/**
 * @param {{[key: string]: import('webextension-polyfill').Storage.StorageChange}} changes
 * @param {"sync" | "local"} area
 */
export async function storageChanged(changes, area) {

  if ('sync' === area) {

    const options = {};

    for (const key in changes)
      if (changes.hasOwnProperty(key))
        options[key] = changes[key].newValue;

    try {
      const tabList = await tabs.query({ currentWindow: true });
      const messageQueue = [];

      for (const tab of tabList)

        if (tab.url.startsWith('http:') || tab.url.startsWith('https:'))
          messageQueue.push(tabs.sendMessage(tab.id, { options }));

      await Promise.all(messageQueue);
    }
    catch (err) {
      console.error('index.js:18:', err);
    }
  }
}

/** @param {import('webextension-polyfill').Runtime.Port} port */
export function connected(port) {

  port.onMessage.addListener(onReceiveMessage);
  port.onDisconnect.addListener(cancelActions);
}

/**
 * @param {{action: 'translate' | 'tts' | 'stop' | 'getCachedTranslation'}} message
 * @param {import('webextension-polyfill').Runtime.Port} port
 */
async function onReceiveMessage(message, port) {

  switch (message.action) {
    case 'translate':
      await doTranslate(message, port);

      break;
    case 'tts':
      await doTTS(message);

      break;
    case 'stop':
      cancelActions(port);

      break;
    case 'getCachedTranslation':
      sendCachedTranslation(message, port);

      break;
  }
}

/** @param {import('webextension-polyfill').Runtime.Port} port */
function cancelActions(port) {

  if (!audio.paused)
    audio.pause();
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
  // console.debug('broadcast.js:89: ', message.text.length);

  if (message.text.length > MAX_TEXT_LEN) {

    port.postMessage({ error: i18n.getMessage('tooLongText', MAX_TEXT_LEN) });

    return;
  }

  const chunks = splitSafe(message.text, 1000);
  let translation = { sourceLang: null, trans: '' };

  try {
    if (1 === chunks.length)
      translation = await translate(chunks[0], message.sourceLang, message.targetLang);
    else
      for (const chunk of chunks) {

        const _translation = await translate(chunk, message.sourceLang, message.targetLang);

        await sleep(200);

        if (null !== _translation) {
          translation.trans += `${_translation.trans} `;
          translation.sourceLang = _translation.sourceLang;
        }
      }

    port.postMessage({
      key: message.text + message.sourceLang + message.targetLang,
      translation,
    });
  }
  catch (err) {
    console.error('broadcast.js:121:', err);

    if (ERROR_BLOCKED_BY_SERVER === err.code)

      port.postMessage({ error: i18n.getMessage('serviceUnavailable') });

  }
}

async function doTTS(message) {

  if (message.text.length > MAX_TEXT_LEN)
    return;

  const chunks = splitSafe(message.text, 160);

  try {
    if (1 === chunks.length) {

      audio.src = await tts(chunks[0], message.targetLang);
      await audio.play();
    }
    else {
      for (const chunk of chunks) {

        audio.src = await tts(chunk, message.targetLang);
        await audio.play();
      }
    }
  }
  catch (err) {
    console.error('broadcast.js:153', err);
  }
}

/**
 * Split a long text into chunks. Make sure the words are not truncated
 * @param {string} text
 * @param {number} chunkLength
 */
function splitSafe(text, chunkLength) {

  const words = text.trim().replace(/\s{2,}/g, ' ')
    .split(' ');
  const chunks = [];
  let chunk = '';

  for (let i = 0, len = words.length; i < len; ++i) {

    chunk += `${words[i]} `;

    if (chunk.length > chunkLength) {

      chunk = chunk.substring(0, chunk.trim().lastIndexOf(' ')).trim();

      chunks.push(chunk);

      chunk = '';
      i--;
    }

    if (i === len - 1)

      chunks.push(chunk.trim());

  }

  return chunks;
}

function sleep(ms) {

  return new Promise((r) => { setTimeout(r, ms) });
}

/**
 * @param {{
 *  text: string;
 *  sourceLang: string;
 *  targetLang: string;
 *  result: any;
 * }} message
 * @param {import('webextension-polyfill').Runtime.Port} port
 */
function sendCachedTranslation(message, port) {

  port.postMessage({
    key: message.text + message.sourceLang + message.targetLang,
    translation: message.result,
  });
}
