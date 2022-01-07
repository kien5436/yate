import { useCallback, useRef } from 'preact/hooks';
import { h } from 'preact';

import '../common/scrollbar';
import debounce from '../common/debounce';
import Icon from "./Icon";
import useTTS from '../hooks/useTTS';

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
    <div className="relative w-1/2">
      <textarea
        ref={textRef}
        className="resize-none h-full w-full p-3 pr-10 has-scrollbar outline-none bg-transparent dark:text-gray-200"
        maxLength={1000}
        rows={10}
        readOnly={readOnly}
        autoFocus={autoFocus}
        value={value}
        onInput={onValueChange}
      />
      <div className="absolute top-3 right-4 flex flex-col">
        {!readOnly &&
        <Icon name="feather-x"
          className="cursor-pointer rounded transition-colors hover:bg-gray-100 mb-2 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={resetValue} />}
        <Icon name="feather-volume"
          className="cursor-pointer rounded transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={readText} />
      </div>
    </div>
  );
}