import 'tailwindcss/tailwind.css';
import { h, render } from 'preact';
import { i18n } from 'webextension-polyfill';
import { useState } from 'preact/hooks';

import '../common/fonts';
import Icon from '../components/Icon';
import LanguageSelection from '../components/LanguageSelection';
import TextBox from '../components/TextBox';
import useTranslation from '../hooks/useTranslation';
import useTTS from '../hooks/useTTS';

function App() {
  const [translatedText, setTranslatedText] = useState('');
  const playSound = useTTS();
  const {
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  } = useTranslation((result) => setTranslatedText(result ? result.trans : ''));

  function swapLanguage() {
    const tmp = sourceLang;

    setSourceLang(targetLang);
    setTargetLang(tmp);
    setText(translatedText);
  }

  return (
    <div className="w-50 overflow-hidden">
      <div className="flex justify-between items-center p-3">
        <h5 className="text-xl font-bold">{i18n.getMessage('extensionName')}</h5>
        <Icon name="feather-list"
          className="cursor-pointer" />
      </div>
      <LanguageSelection className="p-3 pt-0"
        sourceLang={sourceLang}
        setSourceLang={setSourceLang}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        swapLanguage={swapLanguage} />
      <div className="flex divide-x divide-gray-300 border-t border-gray-300">
        <TextBox autoFocus={true}
          lang={sourceLang}
          value={text}
          setValue={setText}
          playSound={playSound} />
        <TextBox readOnly={true}
          lang={targetLang}
          value={translatedText}
          playSound={playSound} />
      </div>
    </div>
  );
}

render(<App />, document.getElementById('yate'));