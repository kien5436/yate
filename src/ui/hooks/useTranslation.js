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
        const sourceText = text.trim();

        if ('' !== sourceText ) {

          const result = await translate(sourceText, sourceLang, targetLang);
          console.info('useTranslation.js:36: ', result);

          if (result.sourceLang && 'auto' === sourceLang) {
            setSourceLang(result.sourceLang);
          }

          if (options.autoSwapLanguages && 'auto' !== sourceLang && result.sourceLang === targetLang) {

            const tmp = sourceLang;

            setSourceLang(targetLang);
            setTargetLang(tmp);
          }

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

  useEffect(() => setOptions((prevOptions) => ({ ...prevOptions, sourceLang })), [setOptions, sourceLang]);

  useEffect(() => setOptions((prevOptions) => ({ ...prevOptions, targetLang })), [setOptions, targetLang]);

  return {
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  };
}