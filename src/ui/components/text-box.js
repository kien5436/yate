import { i18n } from 'webextension-polyfill';

import '../common/base.css';
import '../common/scrollbar.css';
import { MAX_TEXT_LEN } from '../../background/api.js';
import '../components/button-icon.js';
import debounce from '../common/debounce.js';

export default class TextBox extends HTMLElement {

  #debouncedOnInput;
  #debouncedPlayAudio;
  #textarea;

  static observedAttributes = ['langCode'];

  constructor() {
    super();

    this.readOnly = false;
    this.value = '';
    this.autoFocus = false;
    this.#debouncedOnInput = debounce(this.#onInput.bind(this), 700);
    this.#debouncedPlayAudio = debounce(this.#playAudio.bind(this), 700);

    this.onInput = new CustomEvent('yinput', {
      bubbles: false,
      cancelable: false,
      detail: { value: () => this.value },
    });
    this.onClear = new CustomEvent('yclear', {
      bubbles: false,
      cancelable: false,
    });
    this.onClickAudioButton = new CustomEvent('yclickAudioButton', {
      bubbles: false,
      cancelable: false,
      detail: {
        value: () => this.value,
        langCode: () => this.getAttribute('langCode'),
      },
    });
  }

  connectedCallback() {

    const textarea = document.createElement('textarea');

    textarea.setAttribute('class', 'yate:resize-none yate:h-full yate:w-full yate:p-3 yate:pr-10 has-scrollbar yate:outline-none yate:bg-transparent yate:dark:text-zinc-200');
    textarea.maxLength = MAX_TEXT_LEN;
    textarea.rows = 10;
    textarea.readOnly = this.readOnly;
    textarea.value = this.value;
    textarea.autofocus = this.autoFocus;
    textarea.spellcheck = false;
    if (!this.readOnly) textarea.addEventListener('input', this.#debouncedOnInput.bind(this));
    this.#textarea = textarea;

    const audioBtn = document.createElement('button-icon');

    audioBtn.setAttribute('icon', 'feather-volume');
    audioBtn.setAttribute('title', i18n.getMessage('readAloud'));
    audioBtn.addEventListener('yclick', this.#debouncedPlayAudio.bind(this));

    const buttonGroup = document.createElement('div');

    if (!this.readOnly) {

      const clearBtn = document.createElement('button-icon');

      clearBtn.setAttribute('icon', 'feather-x');
      clearBtn.setAttribute('title', i18n.getMessage('clearText'));
      clearBtn.addEventListener('yclick', () => {

        textarea.value = this.value = '';
        this.dispatchEvent(this.onClear);
      });

      buttonGroup.append(clearBtn);
    }

    buttonGroup.setAttribute('class', 'yate:absolute yate:top-3 yate:right-4 yate:flex yate:flex-col');
    buttonGroup.append(audioBtn);

    this.append(textarea, buttonGroup);
    this.classList.add('yate:relative', 'yate:w-1/2');
  }

  /**
   * @param {InputEvent} e
   */
  #onInput(e) {

    this.value = e.target.value;
    this.dispatchEvent(this.onInput);
  }

  #playAudio() {

    this.dispatchEvent(this.onClickAudioButton);
  }

  clearText() { this.#textarea.value = this.value = '' }

  setValue(value) {

    this.#textarea.value = value;
    this.value = value;
  }
}

customElements.define('text-box', TextBox);
