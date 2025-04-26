import { storage } from 'webextension-polyfill';

import { langs } from '../../background/api.js';
import { defaultOptions, getSettings } from '../../settings.js';

export default class SettingsService {

  constructor() {
    /** @type {import('../../settings.js').Settings} */
    this.settings = {};
  }

  async loadSettings() {

    this.settings = await getSettings();
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  async setSettings(key, value) {

    await storage.sync.set({ [key]: value });
    this.settings[key] = value;
  }

  /**
   * @param {'sourceLang' | 'targetLang'} langType
   * @returns {string[]}
   */
  getLanguages(langType) {

    const names = Object.keys(langs).sort();
    const autoLang = names.splice(names.indexOf('Auto detection'), 1);

    return 'sourceLang' === langType ? autoLang.concat(names) : names;
  }

  /**
   * @param {'sourceLang' | 'targetLang'} langType
   * @param {string} langName
   */
  async setLanguage(langType, langName) {

    await storage.sync.set({ [langType]: langs[langName] });
    this.settings[langType] = langs[langName];
  }

  async getSelectedLanguages() {

    const { sourceLang, targetLang } = await storage.sync.get(['sourceLang', 'targetLang']);

    return {
      sourceLang: sourceLang || defaultOptions.sourceLang,
      targetLang: targetLang || defaultOptions.targetLang,
    };
  }
}
