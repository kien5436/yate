import { i18n, runtime, storage } from "webextension-polyfill";
import { useCallback, useEffect, useState } from "preact/hooks";

import mummumHash from '../common/hash';
import useSettings from "./useSettings";

/**
 * @param {import("webextension-polyfill").Runtime.Port} port
 * @return {{
    result: { error: string } | { trans: string },
    setSourceLang: import("preact/hooks").StateUpdater<string>,
    setTargetLang: import("preact/hooks").StateUpdater<string>,
    setText: import("preact/hooks").StateUpdater<string>,
    sourceLang: string,
    targetLang: string,
    text: string,
  }}
 */
export function useBackgroundTranslation(port) {

  const [options] = useSettings();
  const [sourceLang, setSourceLang] = useState(options.sourceLang);
  const [targetLang, setTargetLang] = useState(options.targetLang);
  const [text, setText] = useState('');
  const [result, setResult] = useState({ trans: '' });

  useEffect(() => {

    async function onReceiveMessage(message) {

      // if ('translate' === message.action) {

      if (message.error) {

        setResult({ error: message.error });
        return;
      }

      setResult(message.translation);
      setSourceLang((prevSourceLang) => (message.translation.sourceLang && 'auto' === prevSourceLang ? message.translation.sourceLang : prevSourceLang));

      try {
        const key = mummumHash(message.key);
        /** @type {{indexes: string[] | undefined}} */
        const existedResult = await storage.local.get([key, 'indexes']);

        if (undefined === existedResult.indexes) {
          existedResult.indexes = [];
        }

        if (1000 === existedResult.indexes.length) {

          const deletedKey = existedResult.indexes.splice(0, 1);
          await storage.local.remove(deletedKey);
        }

        existedResult.indexes.push(key);
        await storage.local.set({ indexes: existedResult.indexes, [key]: message.translation });
      }
      catch (err) {
        console.error('useTranslation.js:143:', err);
      }
      // }
    }

    port.onMessage.addListener(onReceiveMessage);

    return () => port.onMessage.removeListener(onReceiveMessage);
  }, [port]);

  useEffect(() => {

    setSourceLang(options.sourceLang);
    setTargetLang(options.targetLang);
  }, [options.sourceLang, options.targetLang]);

  useEffect(() => {

    if (sourceLang === targetLang) return;

    (async () => {
      const sourceText = text.trim();

      if ('' !== sourceText) {

        try {
          const key = mummumHash(sourceText + sourceLang + targetLang);
          /** @type {{indexes: string[] | undefined}} */
          const existedResult = await storage.local.get(key);
          const result = existedResult[key];

          if (undefined === result) {

            port.postMessage({
              action: 'translate',
              sourceLang,
              targetLang,
              text: sourceText,
            });
            return;
          }

          setResult(result);

          if (result.sourceLang && 'auto' === sourceLang) {
            setSourceLang(result.sourceLang);
          }

          if (options.autoSwapLanguages && 'auto' !== sourceLang && result.sourceLang === targetLang) {

            const tmp = sourceLang;

            setSourceLang(targetLang);
            setTargetLang(tmp);
          }
        }
        catch (err) {
          console.error('useTranslation.js:69', err);
          setResult({ error: i18n.getMessage('serviceUnavailable') });
        }
      }
      else {
        setResult({ trans: '' });
      }
    })();
  }, [options.autoSwapLanguages, port, sourceLang, targetLang, text]);

  return {
    result,
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  };
}