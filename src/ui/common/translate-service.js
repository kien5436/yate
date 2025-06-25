import { runtime, storage } from 'webextension-polyfill';

import mummumHash from './hash.js';
import { MAX_CACHE_LEN } from '../../settings.js';

export default class TranslateService {

  #port;

  /**
   * @param {string} name
   */
  constructor(name) {

    this.#port = runtime.connect({ name });
    this.#port.onDisconnect.addListener(() => {
      console.debug('disconnect', name);
    });
  }

  async translate(text, sourceLang, targetLang) {

    const key = mummumHash(text + sourceLang + targetLang);
    /** @type {{indexes: string[] | undefined}} */
    const existedResult = await storage.local.get(key);
    const result = existedResult[key];
    const message = { sourceLang, targetLang, text };

    if (undefined === result) {
      message.action = 'translate';
    }
    else {
      message.action = 'getCachedTranslation';
      message.result = result;
    }

    this.#port.postMessage(message);
  }

  tts(text, targetLang) {

    this.#port.postMessage({
      action: 'tts',
      targetLang,
      text,
    });
  }

  async getSavedTranslations() {

    const { popupSourceText, popupTargetText } = await storage.local.get({ popupSourceText: '', popupTargetText: '' });

    return {
      popupSourceText,
      popupTargetText,
    };
  }

  /**
   * @param {(message: any) => void} callback
   */
  listenForMessage(callback) {

    this.#port.onMessage.addListener(callback);
  }

  /**
   * @param {{
   *  key: string;
   *  translation: import('../../background/api.js').TranslationResult,
   * }} message
   */
  async cache(message) {

    const key = mummumHash(message.key);
    /** @type {{indexes: string[] | undefined}} */
    const existedResult = await storage.local.get([key, 'indexes']);

    if (undefined === existedResult.indexes)
      existedResult.indexes = [];

    if (MAX_CACHE_LEN === existedResult.indexes.length) {

      const deletedKey = existedResult.indexes.splice(0, 1);

      await storage.local.remove(deletedKey);
    }

    existedResult.indexes.push(key);
    await storage.local.set({ indexes: existedResult.indexes, [key]: message.translation });
  }

  async savePopupTranslations(sourceText, targetText) {

    await storage.local.set({ popupSourceText: sourceText, popupTargetText: targetText });
  }
}
