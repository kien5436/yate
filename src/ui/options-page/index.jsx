import 'tailwindcss/tailwind.css';
import { h, render } from 'preact';
import { i18n, runtime, storage } from 'webextension-polyfill';
import { useEffect, useState } from 'preact/hooks';

import '../common/fonts';
import getSettings, { defaultOptions } from '../../settings';
import appIcon from '../../res/icons/96.png';
import ComboBox from '../components/ComboBox';
import Icon from '../components/Icon';

function Control({ children, className = '' }) {
  const [Label, Control] = children;

  return (
    <li className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1">{Label}</div>
      <div className="flex-grow-0">{Control}</div>
    </li>
  );
}

function LinkAddons({ className = '', href, text, children }) {

  return (
    <a href={href}
      target="_blank"
      className={`flex items-center border border-blue-600 text-blue-600 rounded py-1 px-2 text-sm transition hover:bg-blue-600 hover:text-white ${className}`}
      rel="noreferrer">
      {children}
      <span>{text}</span>
    </a>
  );
}

export default function App() {

  const [options, setOptions] = useState(defaultOptions);

  useEffect(() => {

    (async () => {

      const syncedOptions = await getSettings();
      setOptions(syncedOptions);
    })();
  }, []);

  async function setLang(langCode, langType) {
    try {
      await storage.sync.set({ [langType]: langCode });
      setOptions({ ...options, [langType]: langCode });
    }
    catch (err) {
      console.error('index.jsx:50:', err);
    }
  }

  async function resetSettings() {
    try {
      await storage.sync.set(defaultOptions);
      setOptions(defaultOptions);
    }
    catch (err) {
      console.error('index.jsx:37:', err);
    }
  }

  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  async function onCheckboxChange(e) {

    const option = e.target.name;
    const value = 'radio' === e.target.type ? '0' !== e.target.value : e.target.checked;
    const changed = { [option]: value };

    try {
      await storage.sync.set(changed);
      setOptions({ ...options, ...changed });
    }
    catch (err) {
      console.error('index.jsx:62:', err);
    }
  }

  /** @param {React.KeyboardEvent<HTMLInputElement>} e */
  async function onKeyDown(e) {
    const specialKeys = ['Control', 'Shift', 'Alt', 'Tab', 'CapsLock', 'Insert', 'OS', 'NumLock'];
    e.target.value = `${e.ctrlKey ? 'ctrl + ' : ''}${e.altKey ? 'alt + ' : ''}${e.shiftKey ? 'shift + ' : ''}${!specialKeys.includes(e.key) ? (' ' !== e.key ? e.key : 'space') : ''}`;
  }

  return (
    <div className="max-w-lg p-3 mx-auto">
      <div className="shadow border border-gray-300 rounded">
        <a href="https://github.com/kien5436/yate"
          className="flex justify-center items-center p-3">
          <img src={runtime.getURL(appIcon)}
            className="w-8 h-8 mr-3" />
          <h3>
            <p className="font-bold text-xl">{i18n.getMessage('extensionName')}</p>
            <p>{i18n.getMessage('description')}</p>
          </h3>
        </a>
        <ul className="p-3">
          <li className="mb-2 text-blue-400 font-bold">{i18n.getMessage('preferences')}</li>
          <Control className="mb-2">
            <label>{i18n.getMessage('selectSourceLang')}</label>
            <ComboBox
              langType="sourceLang"
              selectedLang={options.sourceLang}
              onLangChange={setLang} />
          </Control>
          <Control className="mb-2">
            <label>{i18n.getMessage('selectTargetLang')}</label>
            <ComboBox
              langType="targetLang"
              selectedLang={options.targetLang}
              onLangChange={setLang} />
          </Control>
          <Control className="mb-2">
            <label>{i18n.getMessage('displayWithButton')}</label>
            <input type="radio"
              name="translateWithButton"
              defaultChecked={options.translateWithButton}
              checked={options.translateWithButton}
              value={1}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="mb-2">
            <label>{i18n.getMessage('displayWithoutButton')}</label>
            <input type="radio"
              name="translateWithButton"
              defaultChecked={!options.translateWithButton}
              checked={!options.translateWithButton}
              value={0}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="mb-2">
            <label>{i18n.getMessage('autoSwapLanguages')}</label>
            <input type="checkbox"
              name="autoSwapLanguages"
              defaultChecked={options.autoSwapLanguages}
              checked={options.autoSwapLanguages}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="mb-2">
            <label>{i18n.getMessage('keepHistory')}</label>
            <input type="checkbox"
              name="keepHistory"
              defaultChecked={options.keepHistory}
              checked={options.keepHistory}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="mb-2">
            <label>{i18n.getMessage('toggleTheme')}</label>
            <input type="checkbox"
              name="darkTheme"
              defaultChecked={options.darkTheme}
              checked={options.darkTheme}
              onChange={onCheckboxChange} />
          </Control>
          <li className="mb-2 text-blue-400 font-bold">{i18n.getMessage('shortcuts')}</li>
          <Control className="mb-2">
            <label>{i18n.getMessage('defineShortcutPopup')}</label>
            <input type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm transition focus:outline-none focus:border-blue-400"
              value={null !== options.shortcutPopup ? options.shortcutPopup : ''}
              onKeyDown={onKeyDown} />
          </Control>
          <Control className="mb-2">
            <label>{i18n.getMessage('translateSelectedText')}</label>
            <input type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm transition focus:outline-none focus:border-blue-400"
              value={null !== options.shortcutSelectedText ? options.shortcutSelectedText : ''}
              onKeyDown={onKeyDown} />
          </Control>
          <Control>
            <label>{i18n.getMessage('translateFullPage')}</label>
            <input type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm transition focus:outline-none focus:border-blue-400"
              value={null !== options.shortcutTranslateFullPage ? options.shortcutTranslateFullPage : ''}
              onKeyDown={onKeyDown} />
          </Control>
        </ul>
        <div className="flex justify-center p-3">
          <button type="button"
            className="border border-blue-600 text-blue-600 rounded py-1 px-2 text-sm transition hover:bg-blue-600 hover:text-white"
            title={i18n.getMessage('resetSettingsTooltip')}
            onClick={resetSettings}>
            {i18n.getMessage('resetSettings')}
          </button>
        </div>
      </div>
      <div className="shadow border border-gray-300 rounded mt-3">
        <div className="flex items-center justify-center p-3">
          <LinkAddons href=""
            text={i18n.getMessage('loveIt')}>
            <Icon name="feather-star" />
          </LinkAddons>
          <LinkAddons href=""
            text={i18n.getMessage('privacy')}
            className="ml-2 mr-2">
            <Icon name="feather-help-circle" />
          </LinkAddons>
          <LinkAddons href="https://github.com/kien5436/yate"
            text="Github">
            <Icon name="feather-github" />
          </LinkAddons>
        </div>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('yate'));