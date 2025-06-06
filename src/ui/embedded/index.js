import { runtime } from 'webextension-polyfill';

import '../common/base.css';
import fonts from '!!css-loader?{"sourceMap":false,"exportType":"string","url":false}!../common/fonts.css';
import '../common/scrollbar.css';
import SettingsService from '../common/settings-service.js';
import TranslateService from '../common/translate-service.js';
import appIcon from '../../res/icons/48.png';
import '../components/language-selection.js';
import '../components/article-box.js';
import debounce from '../common/debounce.js';

const EElementId = {
  Button: 'button',
  Panel: 'panel',
};

customElements.define('yate-translator', class extends HTMLElement {

  #settingsService;
  #translateService;
  /** @type {ShadowRoot} */
  #shadowRoot;
  #displayedComponent = null;
  #BUTTON_SIZE = 24;
  #PANEL_SIZE = 256;

  constructor() {
    super();

    this.#settingsService = new SettingsService();
    this.#translateService = new TranslateService('yate-embedded');
  }

  connectedCallback() {

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const styles = this.#loadStyles();
    const fontStyles = this.#loadFonts();
    const debouncedSelectionChange = debounce(this.#handleAction.bind(this), 300);

    this.#shadowRoot = shadowRoot;
    this.#translateService.listenForMessage(this.#onReceiveMessage.bind(this));

    document.addEventListener('selectionchange', debouncedSelectionChange);
    document.addEventListener('click', (e) => {

      if (e.target !== this)
        this.#hideTooltip();
    });
    document.addEventListener('keyup', (e) => {

      if ('Escape' === e.key)
        this.#hideTooltip();
    });
    shadowRoot.append(...styles);
    document.head.append(fontStyles);
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

  #loadFonts() {

    const style = document.createElement('style');
    const rootUrl = runtime.getURL('');

    style.textContent = fonts.replace(/url\(([^)]+)\)/gm, `url("${rootUrl}$1")`);
    style.id = 'yate-fonts';

    return style;
  }

  #createTranslationButton() {

    const button = document.createElement('button');

    button.id = EElementId.Button;
    button.type = 'button';
    button.classList.add('yate:cursor-pointer', 'yate:border', 'yate:border-solid', 'yate:border-zinc-300', 'yate:rounded-sm', 'yate:w-6', 'yate:h-6', 'yate:p-0.5', 'yate:bg-white', 'yate:dark:bg-zinc-900');

    if (this.#settingsService.settings.darkTheme)
      button.classList.add('yate:dark');

    button.addEventListener('click', this.#handleAction.bind(this));

    const img = document.createElement('img');

    img.src = runtime.getURL(appIcon);

    button.append(img);

    setTimeout(() => {
      if (this.#displayedComponent === button)
        this.#hideTooltip();
    }, 5000);

    return button;
  }

  #createTranslationPane() {

    const pane = document.createElement('div');

    pane.id = EElementId.Panel;
    pane.classList.add('yate:w-64', 'yate:h-64', 'yate:overflow-hidden', 'yate:bg-white', 'yate:rounded', 'yate:shadow', 'yate:text-base', 'yate:text-zinc-800', 'yate:dark:bg-zinc-900', 'yate:dark:text-zinc-200', 'yate:dark:shadow-dark', 'yate:font-nunito', 'yate:flex', 'yate:flex-col', 'yate:gap-1', 'yate:py-3');

    if (this.#settingsService.settings.darkTheme)
      pane.classList.add('yate:dark');

    const languageSelection = document.createElement('language-selection');

    languageSelection.classList.add('yate:px-3');

    pane.append(languageSelection);

    return pane;
  }

  #createScrollableElement() {

    const div = document.createElement('div');

    div.setAttribute('class', 'has-scrollbar yate:overflow-auto yate:px-3');
    div.style.setProperty('max-height', 'calc(16rem - 2.75rem)');

    return div;
  }

  /**
   * @param {string} error
   */
  #createErrorElement(error) {

    const scrollable = this.#createScrollableElement();
    const p = document.createElement('p');

    p.textContent = error;
    p.setAttribute('class', 'yate:text-sm yate:text-gray-600 yate:box-border dark:yate:text-gray-300 yate:px-3 yate:m-0');

    scrollable.append(p);

    return scrollable;
  }

  /**
   * @param {string} originalText
   * @param {import('../../background/api.js').TranslationResult} translation
   */
  #createResultsElement(originalText, translation) {

    const scrollable = this.#createScrollableElement();
    const elems = [];

    /** @type {import('../components/article-box.js').default)} */
    const origin = document.createElement('article-box');

    origin.setAttribute('langCode', translation.sourceLang);
    origin.setAttribute('text', originalText);
    if (translation.spelling) origin.setAttribute('smallText', translation.spelling);

    /** @type {import('../components/article-box.js').default)} */
    const trans = document.createElement('article-box');

    trans.setAttribute('langCode', this.#settingsService.settings.targetLang);
    trans.setAttribute('text', translation.trans);

    elems.push(origin, trans);

    if (translation.synonyms)
      for (const synonym of translation.synonyms) {

        const p = document.createElement('p');

        p.textContent = synonym.type;
        p.setAttribute('class', 'yate:font-bold yate:text-blue-400');

        elems.push(p);

        for (const term of synonym.terms) {

          /** @type {import('../components/article-box.js').default)} */
          const synonymEl = document.createElement('article-box');

          synonymEl.setAttribute('langCode', this.#settingsService.settings.targetLang);
          synonymEl.setAttribute('text', term.word);
          synonymEl.setAttribute('smallText', term.reverseTranslation);

          elems.push(synonymEl);
        }
      }

    scrollable.append(...elems);

    return scrollable;
  }

  /**
   * @param {Event} e
   */
  async #handleAction(e) {

    const selectedText = document.getSelection().toString().trim();

    if ('' === selectedText) return;

    await this.#settingsService.loadSettings();

    const shouldShowButton = 'selectionchange' === e.type && this.#settingsService.settings.translateWithButton;
    const component = shouldShowButton ? this.#createTranslationButton() : this.#createTranslationPane();
    const tooltipSize = shouldShowButton ? this.#BUTTON_SIZE : this.#PANEL_SIZE;
    const { left, top } = this.#computeTooltipPosition(tooltipSize, tooltipSize);

    this.#showTooltip(component, left, top);

    if (EElementId.Panel === this.#displayedComponent.id)
      await this.#translateService.translate(selectedText, this.#displayedComponent.sourceLang, this.#displayedComponent.targetLang);
  }

  /**
   * @param {HTMLElement} component
   * @param {number} left
   * @param {number} top
   */
  #showTooltip(component, left, top) {

    if (null === this.#displayedComponent)
      this.#shadowRoot.append(component);
    else
      this.#shadowRoot.replaceChild(component, this.#displayedComponent);

    this.#displayedComponent = component;

    /** @type {HTMLElement} */
    const host = this.#shadowRoot.host;

    host.style.setProperty('position', 'absolute');
    host.style.setProperty('left', `${left}px`);
    host.style.setProperty('top', `${top}px`);
    host.style.setProperty('z-index', '2147483647');
  }

  #hideTooltip() {

    if (null !== this.#displayedComponent) {

      this.#displayedComponent.remove();
      this.#displayedComponent = null;
    }
  }

  #computeTooltipPosition(tooltipWidth, tooltipHeight) {
    const { x, y, width, height } = document.getSelection().getRangeAt(0).getBoundingClientRect();

    return {
      left: parseInt(x + width / 2 - tooltipWidth / 2, 10),
      top: parseInt(y + window.scrollY + (y + window.scrollY + tooltipHeight + 10 >= document.documentElement.scrollHeight ? -10 - tooltipHeight : height + 10), 10),
    };
  }

  #readAloud(e) {

    const langCode = e.detail.langCode();
    const text = e.detail.text().trim() || '';

    // console.debug(`read '${text}' in '${langCode}', temp lang: ${this.#languageSelection.getTemporarySourceLang()}`);

    if ('' === text || 'auto' === langCode) return;

    this.#translateService.tts(text, langCode);
  }

  /**
   * @param {{
   *  key: string;
   *  text: string;
   *  translation: import('../../background/api.js').TranslationResult,
   * } | {error: string}} message
   */
  async #onReceiveMessage(message) {

    if (message.translation)
      await this.#translateService.cache(message);

    const element = message.error ? this.#createErrorElement(message.error) : this.#createResultsElement(message.text, message.translation);

    this.#displayedComponent.append(element);
  }
});

document.body.append(document.createElement('yate-translator'));
