import { h, render } from 'preact';
import { i18n, runtime, storage } from 'webextension-polyfill';
import { useEffect, useState } from 'preact/hooks';

import '../common/reset';
import '../common/fonts';
import appIcon from '../../res/icons/48.png';
import { extensionUrl } from '../../settings';
import Icon from '../components/Icon';
import LanguageSelection from '../components/LanguageSelection';
import TextBox from '../components/TextBox';
import { useBackgroundTranslation } from '../hooks/useTranslation';
import useSettings from '../hooks/useSettings';

function App() {
  const [options] = useSettings();
  const [port] = useState(runtime.connect);
  const {
    result,
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  } = useBackgroundTranslation(port);

  useEffect(() => {

    if (options.darkTheme) {
      document.documentElement.classList.add('yate-dark');
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
  }, [options.keepHistory]);

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
    setText(result.trans);
  }

  function openSettings() {
    runtime.openOptionsPage();
  }

  return (
    <div className="yate-w-50 yate-overflow-hidden dark:yate-bg-gray-900">
      <div className="yate-flex yate-justify-between yate-items-center yate-p-3">
        <a href="https://github.com/kien5436/yate"
          className="yate-flex yate-items-center">
          <img src={runtime.getURL(appIcon)}
            className="yate-w-5 yate-h-5 yate-mr-3" />
          <h5 className="yate-font-bold yate-text-xl dark:yate-text-gray-200">{i18n.getMessage('extensionName')}</h5>
        </a>
        <div>
          <a href={extensionUrl}
            target="_blank"
            rel="noopener noreferrer">
            <Icon name="feather-star-empty hover:before:yate-content-['\e9d9']"
              className="hover:yate-text-yellow-400 dark:yate-text-gray-200 dark:hover:yate-text-yellow-400"
              title={i18n.getMessage('loveIt')} />
          </a>
          <Icon name="feather-list"
            className="yate-cursor-pointer dark:yate-text-gray-200"
            title={i18n.getMessage('settingsTooltip')}
            onClick={openSettings} />
        </div>
      </div>
      <LanguageSelection className="yate-p-3 yate-pt-0"
        sourceLang={sourceLang}
        setSourceLang={setSourceLang}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        swapLanguage={swapLanguage} />
      <div className="yate-flex yate-divide-x yate-divide-gray-300 yate-border-t yate-border-gray-300 dark:yate-divide-gray-700 dark:yate-border-gray-700">
        <TextBox
          port={port}
          autoFocus={true}
          lang={sourceLang}
          value={text}
          setValue={setText} />
        <TextBox
          port={port}
          readOnly={true}
          lang={targetLang}
          value={result.trans || result.error} />
      </div>
    </div>
  );
}

render(<App />, document.getElementById('yate'));