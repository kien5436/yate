import { h } from 'preact';

import '../common/fonts';
import ComboBox from './ComboBox';
import Icon from './Icon';

export default function LanguageSelection({ sourceLang, setSourceLang, targetLang, setTargetLang, swapLanguage, className = '' }) {
  return (
    <div className={`yate-flex yate-justify-between yate-items-center yate-h-11 yate-space-x-1 ${className}`}>
      <ComboBox className="yate-flex-auto"
        defaultLang={sourceLang}
        onLangChange={setSourceLang}
        langType="sourceLang" />
      <div className="yate-flex-none yate-max-w-min yate-text-center">
        <Icon name="feather-swap"
          className="yate-cursor-pointer yate-rounded yate-transition-colors hover:yate-bg-gray-100 dark:yate-text-gray-200 dark:hover:yate-bg-gray-700"
          onClick={swapLanguage} />
      </div>
      <ComboBox className="yate-flex-auto"
        defaultLang={targetLang}
        onLangChange={setTargetLang}
        langType="targetLang" />
    </div>
  );
}