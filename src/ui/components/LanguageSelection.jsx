import { h } from 'preact';

import '../common/fonts';
import ComboBox from './ComboBox';
import Icon from './Icon';

export default function LanguageSelection({ sourceLang, setSourceLang, targetLang, setTargetLang, swapLanguage, className = '' }) {
  return (
    <div className={`flex justify-center items-center h-11 ${className}`}>
      <ComboBox className="flex-auto"
        selectedLang={sourceLang}
        onLangChange={setSourceLang} />
      <div className="flex-none w-1/12 text-center">
        <Icon name="feather-swap"
          className="cursor-pointer rounded transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={swapLanguage} />
      </div>
      <ComboBox className="flex-auto"
        selectedLang={targetLang}
        onLangChange={setTargetLang} />
    </div>
  );
}