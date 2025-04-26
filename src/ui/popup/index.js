import { i18n, runtime } from 'webextension-polyfill';

import '../common/base.css';
import '../common/fonts.css';
import appIcon from '../../res/icons/48.png';
import { extensionUrl } from '../../settings.js';
import '../components/button-icon.js';
import '../components/language-selection.js';
import '../components/text-box.js';
import SettingsService from '../common/settings-service.js';
import TranslateService from '../common/translate-service.js';

customElements.define('yate-popup', class extends HTMLElement {

  #settingsService;
  #translateService;
  /** @type {import('../components/text-box.js').default')} */
  #sourceTextBox;
  /** @type {import('../components/text-box.js').default')} */
  #targetTextBox;
  /** @type {import('../components/language-selection.js').default} */
  #languageSelection;

  constructor() {
    super();

    this.#settingsService = new SettingsService();
    this.#translateService = new TranslateService('yate-popup');
  }

  async connectedCallback() {

    await this.#settingsService.loadSettings();

    const logo = document.createElement('img');

    logo.setAttribute('src', runtime.getURL(appIcon));
    logo.setAttribute('alt', i18n.getMessage('extensionName'));
    logo.setAttribute('class', 'yate:w-5 yate:h-5');

    const h5 = document.createElement('h5');

    h5.setAttribute('class', 'yate:font-bold yate:text-md');
    h5.textContent = i18n.getMessage('extensionName');

    const logoLink = document.createElement('a');

    logoLink.setAttribute('href', 'https://github.com/kien5436/yate');
    logoLink.setAttribute('target', '_blank');
    logoLink.setAttribute('rel', 'noreferrer noopener');
    logoLink.setAttribute('class', 'yate:flex yate:items-center yate:gap-1');
    logoLink.append(logo, h5);

    const rateBtn = document.createElement('button-icon');

    rateBtn.setAttribute('href', extensionUrl);
    rateBtn.setAttribute('icon', 'feather-star-empty');
    rateBtn.setAttribute('title', i18n.getMessage('loveIt'));

    const settingsBtn = document.createElement('button-icon');

    settingsBtn.setAttribute('icon', 'feather-list');
    settingsBtn.setAttribute('title', i18n.getMessage('settingsTooltip'));
    settingsBtn.addEventListener('yclick', () => runtime.openOptionsPage());

    const buttonGroup = document.createElement('div');

    buttonGroup.append(rateBtn, settingsBtn);

    const header = document.createElement('header');

    header.setAttribute('class', 'yate:flex yate:justify-between yate:items-center');
    header.append(logoLink, buttonGroup);

    const languageSelection = document.createElement('language-selection');

    this.#languageSelection = languageSelection;

    languageSelection.addEventListener('ychange', (e) => {

      const { sourceLang, targetLang } = e.detail.changes();

      this.#sourceTextBox.setAttribute('langCode', sourceLang);
      this.#targetTextBox.setAttribute('langCode', targetLang);
      this.#sourceTextBox.dispatchEvent(this.#sourceTextBox.onInput);
    });
    languageSelection.addEventListener('yswap', (e) => {

      const { sourceLang, targetLang } = e.detail.changes();
      const tmp = this.#sourceTextBox.value;

      this.#sourceTextBox.setAttribute('langCode', sourceLang);
      this.#targetTextBox.setAttribute('langCode', targetLang);
      this.#sourceTextBox.setValue(this.#targetTextBox.value);
      this.#targetTextBox.setValue(tmp);
      this.#sourceTextBox.dispatchEvent(this.#sourceTextBox.onInput);
    });

    /** @type {import('../components/text-box.js').default} */
    const sourceTextBox = document.createElement('text-box');
    /** @type {import('../components/text-box.js').default')} */
    const targetTextBox = document.createElement('text-box');

    sourceTextBox.autoFocus = true;
    sourceTextBox.setAttribute('langCode', this.#settingsService.settings.sourceLang);
    targetTextBox.readOnly = true;
    targetTextBox.setAttribute('langCode', this.#settingsService.settings.targetLang);
    this.#sourceTextBox = sourceTextBox;
    this.#targetTextBox = targetTextBox;

    if (this.#settingsService.settings.keepHistory) {

      const { popupSourceText, popupTargetText } = await this.#translateService.getSavedTranslations();

      sourceTextBox.value = popupSourceText;
      // eslint-disable-next-line require-atomic-updates
      targetTextBox.value = popupTargetText;
    }

    sourceTextBox.addEventListener('yinput', this.#translate.bind(this));
    sourceTextBox.addEventListener('yclear', async () => {
      targetTextBox.clearText();
      await this.#translateService.savePopupTranslations('', '');
    });
    sourceTextBox.addEventListener('yclickAudioButton', this.#readAloud.bind(this));
    targetTextBox.addEventListener('yclickAudioButton', this.#readAloud.bind(this));

    const textBoxGroup = document.createElement('div');

    textBoxGroup.setAttribute('class', 'yate:flex yate:divide-x yate:divide-zinc-300 yate:border-t yate:border-zinc-300 yate:dark:divide-zinc-700 yate:dark:border-zinc-700 yate:-m-3 yate:mt-0');
    textBoxGroup.append(sourceTextBox, targetTextBox);

    this.append(header, languageSelection, textBoxGroup);
    this.setAttribute('class', 'yate:flex yate:flex-col yate:w-125 yate:overflow-hidden yate:p-3 yate:gap-2');

    if (this.#settingsService.settings.darkTheme)
      document.documentElement.classList.add('yate:dark');

    this.#translateService.listenForMessage(this.#onReceiveMessage.bind(this));
  }

  async #translate(e) {

    const { sourceLang, targetLang } = await this.#settingsService.getSelectedLanguages();
    const text = e.detail.value().trim() || '';

    // console.debug(`translate '${text}' from '${sourceLang}' to '${targetLang}', temp lang: ${this.#languageSelection.getTemporarySourceLang()}`);

    if ('' === text) {

      this.#targetTextBox.clearText();
      await this.#translateService.savePopupTranslations('', '');

      return;
    }

    if (sourceLang === targetLang) {

      this.#targetTextBox.setValue(text);

      return;
    }

    await this.#translateService.translate(text, sourceLang, targetLang);
  }

  #readAloud(e) {

    const langCode = e.detail.langCode();
    const text = e.detail.value().trim() || '';

    // console.debug(`read '${text}' in '${langCode}', temp lang: ${this.#languageSelection.getTemporarySourceLang()}`);

    if ('' === text || 'auto' === langCode) return;

    this.#translateService.tts(text, langCode);
  }

  /**
   * @param {{
   *  key: string;
   *  translation: import('../../background/api.js').TranslationResult,
   * } | {error: string}} message
   */
  async #onReceiveMessage(message) {

    if (message.error) {

      this.#targetTextBox.value = message.error;

      return;
    }

    await this.#translateService.cache(message);

    if (this.#settingsService.settings.keepHistory)
      await this.#translateService.savePopupTranslations(this.#sourceTextBox.value, message.translation.trans);

    this.#sourceTextBox.setAttribute('langCode', message.translation.sourceLang);
    this.#targetTextBox.setValue(message.translation.trans);
    this.#languageSelection.setTemporarySourceLang(message.translation.sourceLang);
  }
});
