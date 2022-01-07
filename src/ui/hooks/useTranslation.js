import { i18n, storage } from "webextension-polyfill";
import { useEffect, useState } from "preact/hooks";

import { translate } from "../../background/api";
import getSettings from '../../settings';
import mummumHash from '../common/hash';
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

    if (sourceLang === targetLang) return;

    (async () => {
      try {
        const sourceText = text.trim();

        if ('' !== sourceText) {

          const key = mummumHash(sourceText + sourceLang + targetLang);
          /** @type {{indexes: string[] | undefined}} */
          const existedResult = await storage.local.get([key, 'indexes']);
          let result = null;

          if (undefined === existedResult.indexes) {
            existedResult.indexes = [];
          }

          if (undefined === existedResult[key]) {

            result = await translate(sourceText, sourceLang, targetLang);

            if (1000 === existedResult.indexes.length) {

              const deletedKey = existedResult.indexes.splice(0, 1);
              await storage.local.remove(deletedKey);
            }

            existedResult.indexes.push(key);
            await storage.local.set({ indexes: existedResult.indexes, [key]: result });
          }
          else {
            result = existedResult[key];
          }

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
        console.error('useTranslation.js:69', err);
        setResult({ error: i18n.getMessage('serviceUnavailable') });
      }
    })();
  }, [options.autoSwapLanguages, sourceLang, targetLang, text]);

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