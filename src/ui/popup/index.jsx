import 'tailwindcss/tailwind.css';
import { h, render } from 'preact';
import { i18n, runtime, storage, tabs } from 'webextension-polyfill';
import { useCallback, useEffect, useState } from 'preact/hooks';

import '../common/fonts';
import appIcon from '../../res/icons/48.png';
import { extensionUrl } from '../../settings';
import Icon from '../components/Icon';
import LanguageSelection from '../components/LanguageSelection';
import TextBox from '../components/TextBox';
import useSettings from '../hooks/useSettings';
import useTranslation from '../hooks/useTranslation';

function App() {
  const [options] = useSettings();
  const [translatedText, setTranslatedText] = useState('');
  const setResult = useCallback((result) => setTranslatedText(result ? (result.error ? result.error : result.trans) : ''), []);
  const {
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  } = useTranslation(setResult);

  useEffect(() => {

    if (options.darkTheme) {
      document.querySelector('html').classList.add('dark');
    }
  }, [options.darkTheme]);

  useEffect(() => {

    (async () => {

      if (options.keepHistory) {

        try {
          const { popupText } = await storage.local.get('popupText');

          if (undefined !== popupText) {
            setText(popupText);
          }
        }
        catch (err) {
          console.error('index.jsx:52:', err);
        }
      }

    })();
  }, [options.keepHistory, setText]);

  useEffect(() => {

    (async () => {

      if (options.keepHistory) {

        try {
          await storage.local.set({ popupText: text });
        }
        catch (err) {
          console.error('index.jsx:65:', err);
        }
      }
    })();
  }, [options.keepHistory, text]);

  function swapLanguage() {
    const tmp = sourceLang;

    setSourceLang(targetLang);
    setTargetLang(tmp);
    setText(translatedText);
  }

  function openSettings() {
    tabs.create({ url: runtime.getURL('options.html') });
  }

  return (
    <div className="w-50 overflow-hidden dark:bg-gray-900">
      <div className="flex justify-between items-center p-3">
        <a href="https://github.com/kien5436/yate"
          className="flex items-center">
          <img src={runtime.getURL(appIcon)}
            className="w-5 h-5 mr-3" />
          <h5 className="font-bold text-xl dark:text-gray-200">{i18n.getMessage('extensionName')}</h5>
        </a>
        <div>
          <a href={extensionUrl}
            target="_blank"
            rel="noopener noreferrer">
            <Icon name="feather-star-empty hover:before:content-['\e9d9']"
              className="hover:text-yellow-400 dark:text-gray-200 dark:hover:text-yellow-400"
              title={i18n.getMessage('loveIt')} />
          </a>
          <Icon name="feather-list"
            className="cursor-pointer dark:text-gray-200"
            title={i18n.getMessage('settingsTooltip')}
            onClick={openSettings} />
        </div>
      </div>
      <LanguageSelection className="p-3 pt-0"
        sourceLang={sourceLang}
        setSourceLang={setSourceLang}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        swapLanguage={swapLanguage} />
      <div className="flex divide-x divide-gray-300 border-t border-gray-300 dark:divide-gray-700 dark:border-gray-700">
        <TextBox autoFocus={true}
          lang={sourceLang}
          value={text}
          setValue={setText} />
        <TextBox readOnly={true}
          lang={targetLang}
          value={translatedText} />
      </div>
    </div>
  );
}

render(<App />, document.getElementById('yate'));