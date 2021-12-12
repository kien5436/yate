import 'tailwindcss/tailwind.css';
import { h, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { i18n } from 'webextension-polyfill';

import '../common/fonts';
import { translate, tts } from '../../background/api';
import AudioPlayer from '../common/audio';
import ComboBox from '../components/ComboBox';
import Icon from '../components/Icon';
import TextBox from '../components/TextBox';

function App() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('vi');
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const audio = new AudioPlayer();

  useEffect(() => {
    (async () => {
      try {
        if ('' !== text.trim()) {

          const { trans } = await translate(text.trim(), sourceLang, targetLang);

          setTranslatedText(trans);
        }
        else {
          setTranslatedText('');
        }
      }
      catch (err) {
        console.error('index.jsx:25', err);
        setTranslatedText(i18n.getMessage('serviceUnavailable'));
      }
    })();
  }, [sourceLang, targetLang, text]);

  async function playSound(text, targetLang) {

    try {
      audio.src = await tts(text, targetLang);
      audio.play();
    }
    catch (err) {
      console.error('index.jsx:47:', err);
    }
  }

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
      <div className="flex justify-center items-center p-3 pt-0 h-11">
        <ComboBox className="flex-auto w-5/12"
          selectedLang={sourceLang}
          onLangChange={setSourceLang} />
        <div className="flex-none w-2/12 text-center">
          <Icon name="feather-swap"
            className="cursor-pointer rounded transition-colors hover:bg-gray-100"
            onClick={swapLanguage} />
        </div>
        <ComboBox className="flex-auto w-5/12"
          selectedLang={targetLang}
          onLangChange={setTargetLang} />
      </div>
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

render(<App />, document.getElementById('app'));