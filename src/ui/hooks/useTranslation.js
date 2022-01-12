import { i18n, runtime, storage } from "webextension-polyfill";
import { useEffect, useState } from "preact/hooks";

import { translate } from "../../background/api";
import getSettings from '../../settings';
import mummumHash from '../common/hash';
import useSettings from "./useSettings";

export function useTranslation() {

  const [options] = useSettings();
  const [sourceLang, setSourceLang] = useState(options.sourceLang);
  const [targetLang, setTargetLang] = useState(options.targetLang);
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

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

          setResult(result.trans);
        }
        else {
          setResult('');
        }
      }
      catch (err) {
        console.error('useTranslation.js:69', err);
        setResult(i18n.getMessage('serviceUnavailable') );
      }
    })();
  }, [options.autoSwapLanguages, sourceLang, targetLang, text]);

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

export function useBackgroundTranslation() {

  const [options] = useSettings();
  const [sourceLang, setSourceLang] = useState(options.sourceLang);
  const [targetLang, setTargetLang] = useState(options.targetLang);
  const [text, setText] = useState('');
  const [result, setResult] = useState({ trans: '' });
  const [port, setPort] = useState(null);

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

            port.postMessage({ action: 'translate', text: sourceText });

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
        }
        else {
          setResult({ trans: '' });
        }
      }
      catch (err) {
        console.error('useTranslation.js:69', err);
        setResult({ error: i18n.getMessage('serviceUnavailable') });
      }
    })();
  }, [options.autoSwapLanguages, port, sourceLang, targetLang, text]);

  useEffect(() => {

    async function onReceiveMessage(message) {

      if ('translate' === message.action) {

        if (message.error) {

          setResult({ error: message.error });
          return;
        }

        setResult(message.translation);
        setSourceLang((prevSourceLang) => (message.translation.sourceLang && 'auto' === prevSourceLang ? message.translation.sourceLang : prevSourceLang));

        try {
          const key = mummumHash(text + sourceLang + targetLang);
          /** @type {{indexes: string[] | undefined}} */
          const existedResult = await storage.local.get([key, 'indexes']);

          if (undefined === existedResult.indexes) {
            existedResult.indexes = [];
          }

          // if (options.autoSwapLanguages && 'auto' !== sourceLang && message.translation.sourceLang === targetLang) {

          //   const tmp = sourceLang;

          //   setSourceLang(targetLang);
          //   setTargetLang(tmp);
          // }

          if (1000 === existedResult.indexes.length) {

            const deletedKey = existedResult.indexes.splice(0, 1);
            await storage.local.remove(deletedKey);
          }

          existedResult.indexes.push(key);
          await storage.local.set({ indexes: existedResult.indexes, [key]: message.translation });
        }
        catch (err) {
          console.error('useTranslation.js:216:', err);
        }
      }
    }

    const port = runtime.connect({ name: 'cs' });

    port.onMessage.addListener(onReceiveMessage);
    setPort(port);

    return () => port.onMessage.removeListener(onReceiveMessage);
  }, []);

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