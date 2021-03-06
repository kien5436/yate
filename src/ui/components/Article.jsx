import { h } from 'preact';
import { runtime } from 'webextension-polyfill';
import { useCallback } from 'preact/hooks';

import debounce from '../common/debounce';
import Icon from './Icon';

/**
 * @param {{
 *  text: string
 *  smallText: string
 *  className: string
 *  lang: string
 *  port: import('webextension-polyfill').Runtime.Port
 * }} param0
 */
export default function Article({ text, smallText, className = '', lang, port }) {

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPlaySound = useCallback(debounce((text, targetLang) => port.postMessage({
    action: 'tts',
    targetLang,
    text,
  }), 700), []);

  function readText() {
    if (text) debouncedPlaySound(text, lang);
  }

  return (
    <div className={`yate-flex ${className}`}>
      <div className="yate-w-11/12 yate-pl-3 yate-box-border">
        <p className="yate-text-sm dark:yate-text-gray-200 yate-m-0 yate-box-border">{text}</p>
        {smallText && <small className="yate-box-border yate-text-gray-600 dark:yate-text-gray-300 yate-m-0">{smallText}</small>}
      </div>
      <div className="yate-px-2 yate-box-border">
        <Icon name="feather-volume"
          className="yate-cursor-pointer yate-box-border dark:yate-text-gray-200"
          onClick={readText} />
      </div>
    </div>
  );
}