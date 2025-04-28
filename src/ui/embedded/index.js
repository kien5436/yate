import { runtime } from 'webextension-polyfill';

import '../common/base.css';
import '../common/fonts.css';
import '../common/scrollbar.css';
import SettingsService from '../common/settings-service.js';
import TranslateService from '../common/translate-service.js';
import appIcon from '../../res/icons/48.png';
import '../components/language-selection.js';

customElements.define('yate-translator', class extends HTMLElement {

  #settingsService;
  #translateService;
  /** @type {ShadowRoot} */
  #shadowRoot;
  #displayedComponent;

  constructor() {
    super();

    this.#settingsService = new SettingsService();
    this.#translateService = new TranslateService('yate-embedded');
  }

  async connectedCallback() {

    await this.#settingsService.loadSettings();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const styles = this.#loadStyles();
    const component = this.#settingsService.settings.translateWithButton ? this.#createTranslationButton() : this.#createTranslationPane();

    if (this.#settingsService.settings.darkTheme)
      component.classList.add('yate:dark');

    shadowRoot.append(...styles, component);

    this.#shadowRoot = shadowRoot;
    this.#displayedComponent = component;
    this.#translateService.listenForMessage(this.#onReceiveMessage.bind(this));
  }

  #loadStyles() {

    const manifest = runtime.getManifest();
    const styles = [];

    manifest.web_accessible_resources[1].resources.forEach((file) => {

      const link = document.createElement('link');

      link.rel = 'stylesheet';
      link.href = runtime.getURL(file);

      styles.push(link);
    });

    return styles;
  }

  #createTranslationButton() {

    const button = document.createElement('button');

    button.type = 'button';
    button.classList.add('yate:cursor-pointer', 'yate:border', 'yate:border-solid', 'yate:border-zinc-300', 'yate:rounded-sm', 'yate:w-6', 'yate:h-6', 'yate:p-0.5', 'yate:bg-white', 'yate:dark:bg-zinc-900');

    button.addEventListener('click', () => {

      const pane = this.#createTranslationPane();

      this.#shadowRoot.replaceChild(pane, this.#displayedComponent);
      this.#displayedComponent = pane;
    });

    const img = document.createElement('img');

    img.src = runtime.getURL(appIcon);

    button.append(img);

    return button;
  }

  #createTranslationPane() {

    const pane = document.createElement('div');

    pane.classList.add('yate:w-64', 'yate:max-h-64', 'yate:overflow-hidden', 'yate:bg-white', 'yate:rounded', 'yate:shadow', 'yate:text-base', 'yate:text-zinc-800', 'yate:dark:bg-zinc-900', 'yate:dark:shadow-dark');

    const languageSelection = document.createElement('language-selection');

    pane.append(languageSelection);

    return pane;
  }

  /**
   * @param {{
   *  key: string;
   *  translation: import('../../background/api.js').TranslationResult,
   * } | {error: string}} message
   */
  async #onReceiveMessage(message) {

    if (message.error) {

      console.debug(message.error);

      return;
    }

    await this.#translateService.cache(message);

  }
});

document.body.append(document.createElement('yate-translator'));
