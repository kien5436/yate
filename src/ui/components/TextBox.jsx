import { useCallback, useRef } from 'preact/hooks';
import { h } from 'preact';
import { runtime } from 'webextension-polyfill';

import '../common/scrollbar';
import debounce from '../common/debounce';
import Icon from "./Icon";
import { MAX_TEXT_LEN } from '../../background/api';

/**
 * @param {{
 *  readOnly: boolean,
 *  autoFocus: boolean,
 *  lang: string,
 *  value: string,
 *  setValue: Function,
 *  playSound: Function<Promise>,
 *  port: import('webextension-polyfill').Runtime.Port,
 * }} props
 */
export default function TextBox({ readOnly = false, autoFocus = false, lang, value, setValue, port }) {
  const textRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetValue = useCallback(debounce(setValue, 700), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPlaySound = useCallback(debounce((text, targetLang) => port.postMessage({
    action: 'tts',
    targetLang,
    text,
  }), 700), []);

  function resetValue() {
    setValue('');
    textRef.current.focus();
  }

  function onValueChange(e) {
    debouncedSetValue(e.target.value);
  }

  function readText() {

    if (value) debouncedPlaySound(value, lang);
  }

  return (
    <div className="yate-relative yate-w-1/2">
      <textarea
        ref={textRef}
        className="yate-resize-none yate-h-full yate-w-full yate-p-3 yate-pr-10 has-scrollbar yate-outline-none yate-bg-transparent dark:yate-text-gray-200"
        maxLength={MAX_TEXT_LEN}
        rows={10}
        readOnly={readOnly}
        autoFocus={autoFocus}
        value={value}
        onInput={onValueChange}
      />
      <div className="yate-absolute yate-top-3 yate-right-4 yate-flex yate-flex-col">
        {!readOnly &&
        <Icon name="feather-x"
          className="yate-cursor-pointer yate-rounded yate-transition-colors hover:yate-bg-gray-100 yate-mb-2 dark:yate-text-gray-200 dark:hover:yate-bg-gray-700"
          onClick={resetValue} />}
        <Icon name="feather-volume"
          className="yate-cursor-pointer yate-rounded yate-transition-colors hover:yate-bg-gray-100 dark:yate-text-gray-200 dark:hover:yate-bg-gray-700"
          onClick={readText} />
      </div>
    </div>
  );
}