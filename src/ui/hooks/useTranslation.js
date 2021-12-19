import { useEffect, useState } from "preact/hooks";
import { i18n } from "webextension-polyfill";

import { translate } from "../../background/api";

/**
 * @param {(result: {} | null) => void} setResult
 */
export default function useTranslation(setResult) {

  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('vi');
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        if ('' !== text.trim()) {

          const result = await translate(text.trim(), sourceLang, targetLang);

          setResult(result);
        }
        else {
          setResult(null);
        }
      }
      catch (err) {
        console.error('useTranslation.js:29', err);
        setResult(i18n.getMessage('serviceUnavailable'));
      }
    })();
  }, [sourceLang, targetLang, text]);

  return {
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  };
}