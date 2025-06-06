import { i18n } from 'webextension-polyfill';

import debounce from '../common/debounce.js';
import './button-icon.js';

export default class ArticleBox extends HTMLElement {

  #debouncedPlayAudio;

  static observedAttributes = ['langCode', 'text', 'smallText'];

  constructor() {
    super();

    this.#debouncedPlayAudio = debounce(this.#playAudio.bind(this), 700);

    this.onClickAudioButton = new CustomEvent('yclickAudioButton', {
      bubbles: false,
      cancelable: false,
      detail: {
        text: () => this.getAttribute('text'),
        langCode: () => this.getAttribute('langCode'),
      },
    });
  }

  connectedCallback() {

    const wrapper = document.createElement('div');
    const p = document.createElement('p');

    p.textContent = this.getAttribute('text');

    wrapper.setAttribute('class', 'yate:w-11/12');
    wrapper.append(p);

    if (this.getAttribute('smallText')) {

      const small = document.createElement('small');

      small.textContent = this.getAttribute('smallText');

      wrapper.append(small);
    }

    const audioBtn = document.createElement('button-icon');

    audioBtn.setAttribute('icon', 'feather-volume');
    audioBtn.setAttribute('title', i18n.getMessage('readAloud'));
    audioBtn.addEventListener('yclick', this.#debouncedPlayAudio.bind(this));

    this.classList.add('yate:flex', 'yate:gap-3');
    this.append(wrapper, audioBtn);
  }

  #playAudio() {

    this.dispatchEvent(this.onClickAudioButton);
  }
}

customElements.define('article-box', ArticleBox);
