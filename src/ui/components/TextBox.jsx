import { useCallback, useRef } from 'preact/hooks';
import { h } from 'preact';

import '../common/scrollbar';
import debounce from '../common/debounce';
import Icon from "./Icon";
import { useTTS } from '../hooks/useTTS';

/**
 * @param {{
 *  readOnly: boolean,
 *  autoFocus: boolean,
 *  lang: string,
 *  value: string,
 *  setValue: Function,
 *  playSound: Function<Promise>,
 * }} props
 */
export default function TextBox({ readOnly = false, autoFocus = false, lang, value, setValue }) {
  const textRef = useRef(null);
  const playSound = useTTS();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetValue = useCallback(debounce(setValue, 700), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPlaySound = useCallback(debounce(playSound, 700), []);

  function resetValue() {
    setValue('');
    textRef.current.focus();
  }

  function onValueChange(e) {
    debouncedSetValue(e.target.value);
  }

  function readText() {
    debouncedPlaySound(value, lang);
  }

  return (
    <div className="yate-relative yate-w-1/2">
      <textarea
        ref={textRef}
        className="yate-resize-none yate-h-full yate-w-full yate-p-3 yate-pr-10 has-scrollbar yate-outline-none yate-bg-transparent dark:yate-text-gray-200"
        maxLength={1000}
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