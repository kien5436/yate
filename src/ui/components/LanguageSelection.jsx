import { h } from 'preact';

import '../common/fonts';
import ComboBox from './ComboBox';
import Icon from './Icon';

export default function LanguageSelection({ sourceLang, setSourceLang, targetLang, setTargetLang, swapLanguage, className = '' }) {
  return (
    <div className={`flex justify-between items-center h-11 space-x-1 ${className}`}>
      <ComboBox className="flex-auto"
        defaultLang={sourceLang}
        onLangChange={setSourceLang}
        langType="sourceLang" />
      <div className="flex-none max-w-min text-center">
        <Icon name="feather-swap"
          className="cursor-pointer rounded transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={swapLanguage} />
      </div>
      <ComboBox className="flex-auto"
        defaultLang={targetLang}
        onLangChange={setTargetLang}
        langType="targetLang" />
    </div>
  );
}