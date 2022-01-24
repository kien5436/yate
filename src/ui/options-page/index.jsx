import { h, render } from 'preact';
import { i18n, runtime, storage } from 'webextension-polyfill';
import { useEffect } from 'preact/hooks';

import '../common/reset';
import '../common/fonts';
import { defaultOptions, extensionUrl } from '../../settings';
import appIcon from '../../res/icons/96.png';
import ComboBox from '../components/ComboBox';
import Icon from '../components/Icon';
import useSettings from '../hooks/useSettings';

function Control({ children, className = '' }) {
  const [Label, Control] = children;

  return (
    <li className={`yate-flex yate-items-center yate-space-x-3 ${className}`}>
      <div className="yate-flex-1">{Label}</div>
      <div className="yate-flex-grow-0">{Control}</div>
    </li>
  );
}

function LinkAddons({ className = '', href, text, children }) {

  return (
    <a href={href}
      target="_blank"
      className={`yate-flex yate-items-center yate-border yate-border-blue-600 yate-text-blue-600 yate-rounded yate-py-1 yate-px-2 yate-text-sm yate-transition hover:yate-bg-blue-600 hover:yate-text-white ${className}`}
      rel="noreferrer">
      {children}
      <span>{text}</span>
    </a>
  );
}

export default function App() {

  const [options, setOptions] = useSettings();

  useEffect(() => {

    if (options.darkTheme) {
      document.documentElement.classList.add('yate-dark');
    }
    else {
      document.documentElement.classList.remove('yate-dark');
    }
  }, [options.darkTheme]);

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
    <div className="yate-max-w-lg yate-p-3 yate-mx-auto">
      <div className="yate-shadow yate-border yate-border-gray-300 yate-rounded dark:yate-bg-gray-900 dark:yate-border-gray-700 dark:yate-shadow-dark">
        <a href="https://github.com/kien5436/yate"
          className="yate-flex yate-justify-center yate-items-center yate-p-3">
          <img src={runtime.getURL(appIcon)}
            className="yate-w-8 yate-h-8 yate-mr-3" />
          <h3 className="dark:yate-text-gray-200">
            <p className="yate-font-bold yate-text-xl">
              {i18n.getMessage('extensionName')}
              <small> {runtime.getManifest().version}</small>
            </p>
            <p>{i18n.getMessage('description')}</p>
          </h3>
        </a>
        <ul className="yate-p-3">
          <li className="yate-mb-2 yate-text-blue-400 yate-font-bold">{i18n.getMessage('preferences')}</li>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('selectSourceLang')}</label>
            <ComboBox
              langType="sourceLang"
              defaultLang={options.sourceLang}
              onLangChange={setLang} />
          </Control>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('selectTargetLang')}</label>
            <ComboBox
              langType="targetLang"
              defaultLang={options.targetLang}
              onLangChange={setLang} />
          </Control>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('displayWithButton')}</label>
            <input type="radio"
              name="translateWithButton"
              defaultChecked={options.translateWithButton}
              checked={options.translateWithButton}
              value={1}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('displayWithoutButton')}</label>
            <input type="radio"
              name="translateWithButton"
              defaultChecked={!options.translateWithButton}
              checked={!options.translateWithButton}
              value={0}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('autoSwapLanguages')}</label>
            <input type="checkbox"
              name="autoSwapLanguages"
              defaultChecked={options.autoSwapLanguages}
              checked={options.autoSwapLanguages}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('keepHistory')}</label>
            <input type="checkbox"
              name="keepHistory"
              defaultChecked={options.keepHistory}
              checked={options.keepHistory}
              onChange={onCheckboxChange} />
          </Control>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('toggleTheme')}</label>
            <input type="checkbox"
              name="darkTheme"
              defaultChecked={options.darkTheme}
              checked={options.darkTheme}
              onChange={onCheckboxChange} />
          </Control>
          {/* <li className="yate-mb-2 yate-text-blue-400 yate-font-bold">{i18n.getMessage('shortcuts')}</li>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('defineShortcutPopup')}</label>
            <input type="text"
              className="yate-border yate-border-gray-300 yate-bg-transparent yate-rounded yate-px-2 yate-py-1 yate-text-sm yate-transition focus:yate-outline-none focus:yate-border-blue-400 dark:yate-text-gray-200 dark:yate-border-gray-700"
              placeholder={i18n.getMessage('placeholderShortcut')}
              value={null !== options.shortcutPopup ? options.shortcutPopup : ''}
              onKeyDown={onKeyDown} />
          </Control>
          <Control className="yate-mb-2">
            <label className="dark:yate-text-gray-200">{i18n.getMessage('translateSelectedText')}</label>
            <input type="text"
              className="yate-border yate-border-gray-300 yate-bg-transparent yate-rounded yate-px-2 yate-py-1 yate-text-sm yate-transition focus:yate-outline-none focus:yate-border-blue-400 dark:yate-text-gray-200 dark:yate-border-gray-700"
              placeholder={i18n.getMessage('placeholderShortcut')}
              value={null !== options.shortcutSelectedText ? options.shortcutSelectedText : ''}
              onKeyDown={onKeyDown} />
          </Control>
          <Control>
            <label className="dark:yate-text-gray-200">{i18n.getMessage('translateFullPage')}</label>
            <input type="text"
              className="yate-border yate-border-gray-300 yate-bg-transparent yate-rounded yate-px-2 yate-py-1 yate-text-sm yate-transition focus:yate-outline-none focus:yate-border-blue-400 dark:yate-text-gray-200 dark:yate-border-gray-700"
              placeholder={i18n.getMessage('placeholderShortcut')}
              value={null !== options.shortcutTranslateFullPage ? options.shortcutTranslateFullPage : ''}
              onKeyDown={onKeyDown} />
          </Control> */}
        </ul>
        <div className="yate-flex yate-justify-center yate-p-3">
          <button type="button"
            className="yate-border yate-border-blue-600 yate-text-blue-600 yate-rounded yate-py-1 yate-px-2 yate-text-sm yate-transition hover:yate-bg-blue-600 hover:yate-text-white"
            title={i18n.getMessage('resetSettingsTooltip')}
            onClick={resetSettings}>
            {i18n.getMessage('resetSettings')}
          </button>
        </div>
      </div>
      <div className="yate-shadow yate-border yate-border-gray-300 yate-rounded yate-mt-3 dark:yate-bg-gray-900 dark:yate-border-gray-700 dark:yate-shadow-dark">
        <div className="yate-flex yate-items-center yate-justify-center yate-p-3">
          <LinkAddons href={extensionUrl}
            text={i18n.getMessage('loveIt')}>
            <Icon name="feather-star-empty" />
          </LinkAddons>
          <LinkAddons href="https://kien5436.github.io/yate/privacy.html"
            text={i18n.getMessage('privacy')}
            className="yate-ml-2 yate-mr-2">
            <Icon name="feather-help-circle" />
          </LinkAddons>
          <LinkAddons href="https://kien5436.github.io/yate/"
            text="Github">
            <Icon name="feather-github" />
          </LinkAddons>
        </div>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('yate'));