import { i18n, storage } from "webextension-polyfill";
import { useEffect, useState } from "preact/hooks";

import getSettings from '../../settings';
import { translate } from "../../background/api";
import useSettings from "./useSettings";

/**
 * @param {(result: {} | null) => void} setResult
 */
export default function useTranslation(setResult) {

  const [options, setOptions] = useSettings();
  const [sourceLang, setSourceLang] = useState(options.sourceLang);
  const [targetLang, setTargetLang] = useState(options.targetLang);
  const [text, setText] = useState('');

  useEffect(() => {

    (async () => {

      const syncedOptions = await getSettings();
      setSourceLang(syncedOptions.sourceLang);
      setTargetLang(syncedOptions.targetLang);
    })();
  }, []);

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
  }, [setResult, sourceLang, targetLang, text]);

  useEffect(() => {

    setOptions((prevOptions) => ({ ...prevOptions, sourceLang }));
    storage.sync.set({ sourceLang });
  }, [sourceLang]);

  useEffect(() => {

    setOptions((prevOptions) => ({ ...prevOptions, targetLang }));
    storage.sync.set({ targetLang });
  }, [targetLang]);

  return {
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  };
}