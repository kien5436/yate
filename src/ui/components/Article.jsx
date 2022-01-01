import { h } from 'preact';

import Icon from './Icon';
import useTTS from '../hooks/useTTS';

/**
 * @param {{
 *  text: string
 *  smallText: string
 *  className: string
 *  lang: string
 * }} param0
 */
export default function Article({ text, smallText, className = '', lang }) {

  const playSound = useTTS();

  function readText() {
    playSound(text, lang);
  }

  return (
    <div className={`flex ${className}`}>
      <div className="w-11/12 pl-3">
        <p className="dark:text-gray-200">{text}</p>
        {smallText && <p className="text-sm text-gray-600 dark:text-gray-300">{smallText}</p>}
      </div>
      <div className="px-2">
        <Icon name="feather-volume"
          className="cursor-pointer dark:text-gray-200"
          onClick={readText} />
      </div>
    </div>
  );
}