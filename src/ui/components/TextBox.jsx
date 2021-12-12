import { useCallback, useRef } from 'preact/hooks';
import { h } from 'preact';

import '../common/scrollbar';
import debounce from '../common/debounce';
import Icon from "./Icon";

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
export default function TextBox({ readOnly = false, autoFocus = false, lang, value, setValue, playSound }) {
  const textRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetValue = useCallback(debounce(setValue, 700), []);

  function resetValue() {
    setValue('');
    textRef.current.focus();
  }

  function onValueChange(e) {
    debouncedSetValue(e.target.value);
  }

  function readText() {
    playSound(value, lang);
  }

  return (
    <div className="relative w-1/2">
      <textarea
        ref={textRef}
        className="resize-none h-full w-full p-3 pr-10 has-scrollbar outline-none"
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
          className="cursor-pointer rounded transition-colors hover:bg-gray-100 mb-2"
          onClick={resetValue} />}
        <Icon name="feather-volume"
          className="cursor-pointer rounded transition-colors hover:bg-gray-100"
          onClick={readText} />
      </div>
    </div>
  );
}