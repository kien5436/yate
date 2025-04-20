import { i18n } from 'webextension-polyfill';

import './combo-box.js';
import { langs } from '../../background/api.js';

customElements.define('preferences-pane', class extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {

    /** @type {import('./combo-box.js').default} */
    const sourceLangComboBox = document.createElement('combo-box');

    sourceLangComboBox.setAttribute('placeholder', i18n.getMessage('placeholderSelectLanguage'));
    sourceLangComboBox.options = this.#languages('source');
    sourceLangComboBox.selected = 'Auto detection';

    this.append(sourceLangComboBox);
  }

  /**
   * @param {'source' | 'target'} langType
   * @returns {string[]}
   */
  #languages(langType) {

    const names = Object.keys(langs).sort();
    const autoLang = names.splice(names.indexOf('Auto detection'), 1);

    return 'source' === langType ? autoLang.concat(names) : names;
  }
});
