import { i18n } from 'webextension-polyfill';

import '../components/combo-box.js';
import '../components/button-icon.js';
import SettingsService from '../common/settings-service.js';
import { langs, reversedLangs } from '../../background/api.js';

export default class LanguageSelection extends HTMLElement {

  #settingsService;
  #sourceLangComboBox;
  #targetLangComboBox;

  constructor() {
    super();

    this.#settingsService = new SettingsService();
    this.hasSwapButton = true;

    this.onChange = new CustomEvent('ychange', {
      bubbles: false,
      cancelable: false,
      detail: {
        changes: () => ({
          sourceLang: this.getTemporarySourceLang() || this.#settingsService.settings.sourceLang,
          targetLang: this.#settingsService.settings.targetLang,
        }),
      },
    });
    this.onSwap = new CustomEvent('yswap', {
      bubbles: false,
      cancelable: false,
      detail: {
        changes: () => ({
          sourceLang: this.getTemporarySourceLang() || this.#settingsService.settings.sourceLang,
          targetLang: this.#settingsService.settings.targetLang,
        }),
      },
    });
  }

  async connectedCallback() {

    await this.#settingsService.loadSettings();

    const components = [];
    const sourceLangComboBox = this.#createLangComboBox({
      placeholder: i18n.getMessage('placeholderSelectLanguage'),
      selected: reversedLangs[this.#settingsService.settings.sourceLang],
      langType: 'sourceLang',
    });
    const targetLangComboBox = this.#createLangComboBox({
      placeholder: i18n.getMessage('placeholderSelectLanguage'),
      selected: reversedLangs[this.#settingsService.settings.targetLang],
      langType: 'targetLang',
    });

    this.#sourceLangComboBox = sourceLangComboBox;
    this.#targetLangComboBox = targetLangComboBox;

    components.push(sourceLangComboBox);

    if (this.hasSwapButton) {

      const swapButton = this.#createSwapButton();

      if ('auto' === this.#settingsService.settings.sourceLang)
        swapButton.classList.add('yate:cursor-not-allowed!');

      components.push(swapButton);
    }

    components.push(targetLangComboBox);

    this.append(...components);
    this.classList.add('yate:flex', 'yate:justify-between', 'yate:items-center', 'yate:h-11', 'yate:gap-1');
  }

  /**
   * @param {{placeholder: string, selected?: string, langType: 'sourceLang' | 'targetLang'}}
   * @returns {import('./form-control.js').default}
   */
  #createLangComboBox({
    placeholder,
    selected = '',
    langType,
  } = {}) {

    /** @type {import('./combo-box.js').default} */
    const comboBox = document.createElement('combo-box');

    comboBox.setAttribute('inputId', langType);
    comboBox.setAttribute('placeholder', placeholder);
    comboBox.classList.add('yate:w-1/2');
    comboBox.options = this.#settingsService.getLanguages(langType);
    comboBox.selected = selected;

    comboBox.addEventListener('ychange', async (e) => {

      await this.#settingsService.setLanguage(langType, e.detail.value());
      this.dispatchEvent(this.onChange);
    });

    return comboBox;
  }

  #createSwapButton() {

    const button = document.createElement('button-icon');

    button.setAttribute('icon', 'feather-swap');
    button.setAttribute('title', i18n.getMessage('swapLanguages'));
    button.addEventListener('yclick', async () => {

      const sourceLang = this.getTemporarySourceLang() || this.#settingsService.settings.sourceLang;
      const targetLang = this.#settingsService.settings.targetLang;

      if ('auto' === sourceLang || sourceLang === targetLang) return;

      await this.#settingsService.setLanguage('sourceLang', reversedLangs[targetLang]);
      await this.#settingsService.setLanguage('targetLang', reversedLangs[sourceLang]);

      this.#sourceLangComboBox.selected = reversedLangs[targetLang];
      this.#targetLangComboBox.selected = reversedLangs[sourceLang];

      this.dispatchEvent(this.onSwap);
    });

    return button;
  }

  setTemporarySourceLang(langCode) {

    this.#sourceLangComboBox.selected = reversedLangs[langCode];
  }

  getTemporarySourceLang() {

    return langs[this.#sourceLangComboBox.selected];
  }
}

customElements.define('language-selection', LanguageSelection);
