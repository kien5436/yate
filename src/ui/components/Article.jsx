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
 * }} param0
 */
export default function Article({ text, smallText, className = '', lang }) {

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPlaySound = useCallback(debounce((text, targetLang) => runtime.sendMessage({ targetLang, text }), 700), []);

  function readText() {
    if ('' !== text) debouncedPlaySound(text, lang);
  }

  return (
    <div className={`yate-flex ${className}`}>
      <div className="yate-w-11/12 yate-pl-3">
        <p className="dark:yate-text-gray-200 yate-m-0">{text}</p>
        {smallText && <p className="yate-text-sm yate-text-gray-600 dark:yate-text-gray-300 yate-m-0">{smallText}</p>}
      </div>
      <div className="yate-px-2">
        <Icon name="feather-volume"
          className="yate-cursor-pointer dark:yate-text-gray-200"
          onClick={readText} />
      </div>
    </div>
  );
}