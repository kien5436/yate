import { i18n, storage } from 'webextension-polyfill';

import './combo-box.js';
import './form-control.js';
import { reversedLangs } from '../../background/api.js';
import { defaultOptions } from '../../settings.js';
import SettingsService from '../common/settings-service.js';

customElements.define('preferences-pane', class extends HTMLElement {

  #settingsService;

  constructor() {
    super();

    this.#settingsService = new SettingsService();
  }

  async connectedCallback() {

    await this.#render();
  }

  /**
   * @param {{placeholder: string, selected?: string, label: string, langType: 'sourceLang' | 'targetLang'}}
   * @returns {import('./form-control.js').default}
   */
  #createLangControl({
    placeholder,
    selected = '',
    label,
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
    });

    return this.#createControl({
      label,
      labelClass: 'yate:w-1/2',
      inputId: langType,
      controller: comboBox,
    });
  }

  /**
   * @param {{checked?: boolean, label: string, inputId: string, value: string}}
   * @returns {import('./form-control.js').default}
   */
  #createDisplayControl({
    checked = false,
    label,
    inputId,
    value,
  } = {}) {

    const input = this.#createInput({
      type: 'radio',
      name: 'display',
      inputId,
      checked,
      value,
    });

    input.addEventListener('change', async (e) => {

      await this.#settingsService.setSettings('translateWithButton', '1' === e.target.value);
    });

    return this.#createControl({
      label,
      labelClass: 'yate:flex-1',
      inputId,
      controller: input,
    });
  }

  /**
   * @param {{checked?: boolean, label: string, inputId: string, name: string}}
   * @returns {import('./form-control.js').default}
   */
  #createCheckboxControl({
    checked = false,
    label,
    inputId,
    name,
  } = {}) {

    const input = this.#createInput({
      type: 'checkbox',
      name,
      inputId,
      checked,
    });

    input.addEventListener('change', async (e) => {

      await this.#settingsService.setSettings(name, e.target.checked);

      if ('darkTheme' === name)
        document.documentElement.classList.toggle('yate:dark', e.target.checked);
    });

    return this.#createControl({
      label,
      labelClass: 'yate:flex-1',
      inputId,
      controller: input,
    });
  }

  /**
   * @param {{label: string, labelClass?: string, inputId: string, controller: HTMLElement}}
   * @returns {import('./form-control.js').default}
   */
  #createControl({
    label,
    labelClass = '',
    inputId,
    controller,
  } = {}) {

    /** @type {import('./form-control.js').default} */
    const formControl = document.createElement('form-control');

    formControl.setAttribute('label', label);
    formControl.setAttribute('for', inputId);
    formControl.setAttribute('labelClass', labelClass);
    formControl.controller = controller;

    return formControl;
  }

  /**
   * @param {{type: string, name: string, inputId: string, checked?: boolean, value?: string}}
   * @returns {HTMLInputElement}
   */
  #createInput({
    type,
    name,
    inputId,
    checked = false,
    value = '',
  } = {}) {

    const input = document.createElement('input');

    input.setAttribute('type', type);
    input.setAttribute('name', name);
    input.id = inputId;
    input.value = value;
    if (checked) input.setAttribute('checked', '');

    return input;
  }

  async #render() {

    await this.#settingsService.loadSettings();

    const preferencesLabel = document.createElement('p');

    preferencesLabel.textContent = i18n.getMessage('preferences');
    preferencesLabel.setAttribute('class', 'yate:font-bold yate:dark:text-zinc-200');

    const sourceLangFormControl = this.#createLangControl({
      placeholder: i18n.getMessage('placeholderSelectLanguage'),
      selected: reversedLangs[this.#settingsService.settings.sourceLang],
      label: i18n.getMessage('selectSourceLang'),
      langType: 'sourceLang',
    });
    const targetLangFormControl = this.#createLangControl({
      placeholder: i18n.getMessage('placeholderSelectLanguage'),
      selected: reversedLangs[this.#settingsService.settings.targetLang],
      label: i18n.getMessage('selectTargetLang'),
      langType: 'targetLang',
    });
    const displayWithBtnControl = this.#createDisplayControl({
      label: i18n.getMessage('displayWithButton'),
      inputId: 'displayWithBtn',
      checked: this.#settingsService.settings.translateWithButton,
      value: '1',
    });
    const displayWithoutBtnControl = this.#createDisplayControl({
      label: i18n.getMessage('displayWithoutButton'),
      inputId: 'displayWithoutBtn',
      checked: !this.#settingsService.settings.translateWithButton,
      value: '0',
    });
    const keepHistoryControl = this.#createCheckboxControl({
      label: i18n.getMessage('keepHistory'),
      inputId: 'keepHistory',
      name: 'keepHistory',
      checked: this.#settingsService.settings.keepHistory,
    });
    const autoSwapLangsControl = this.#createCheckboxControl({
      label: i18n.getMessage('autoSwapLanguages'),
      inputId: 'autoSwapLangs',
      name: 'autoSwapLanguages',
      checked: this.#settingsService.settings.autoSwapLanguages,
    });
    const toggleThemeControl = this.#createCheckboxControl({
      label: i18n.getMessage('toggleTheme'),
      inputId: 'toggleTheme',
      name: 'darkTheme',
      checked: this.#settingsService.settings.darkTheme,
    });

    const resetBtn = document.createElement('button');

    resetBtn.textContent = i18n.getMessage('resetSettings');
    resetBtn.title = i18n.getMessage('resetSettingsTooltip');
    resetBtn.setAttribute('class', 'yate:border yate:border-blue-400 yate:text-blue-400 yate:rounded yate:py-1 yate:px-2 yate:text-sm yate:transition yate:hover:bg-blue-400 yate:hover:text-white yate:cursor-pointer');

    resetBtn.addEventListener('click', async () => {

      await storage.sync.set(defaultOptions);
      await this.#render();
    });

    const buttonGroup = document.createElement('div');

    buttonGroup.setAttribute('class', 'yate:flex yate:justify-center yate:p-3');
    buttonGroup.append(resetBtn);

    this.replaceChildren(
      preferencesLabel,
      sourceLangFormControl,
      targetLangFormControl,
      displayWithBtnControl,
      displayWithoutBtnControl,
      autoSwapLangsControl,
      keepHistoryControl,
      toggleThemeControl,
      buttonGroup,
    );
    this.classList.add('yate:flex', 'yate:flex-col', 'yate:gap-2', 'yate:p-3');

    document.documentElement.classList.toggle('yate:dark', this.#settingsService.settings.darkTheme);
  }
});
