import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { h } from 'preact';
import { i18n } from 'webextension-polyfill';

import '../common/scrollbar';
import { langs } from '../../background/api';

export default function ComboBox({ className = '', defaultLang, onLangChange, langType }) {

  const dropdown = useRef(null);
  const langNames = useMemo(() => {

    const names = Object.keys(langs).sort();
    const autoLang = names.splice(names.indexOf('Auto detection'), 1);

    return 'sourceLang' === langType ? autoLang.concat(names) : names;
  }, [langType]);
  const [dedicatedLangs, setDedicatedLangs] = useState(langNames);
  const [selectedLangName, setSelectedLangName] = useState('');
  const [typing, setTypeStatus] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => setSelectedLangName(getLangName(defaultLang)), [defaultLang]);

  function getLangName(langCode) {

    for (const lang in langs) {
      if (langs.hasOwnProperty(lang) && langs[lang] === langCode) {

        return lang;
      }
    }

    return '';
  }

  function toggleDropdown() {

    setTypeStatus(!typing);
    setInput(selectedLangName);
    dropdown.current.classList.toggle('yate-hidden');
  }

  function selectLang(e) {
    onLangChange(e.target.dataset.langCode, langType);
  }

  function filterLanguage(e) {
    const value = e.target.value.trim().toLowerCase();
    const filtered = langNames.filter((lang) => lang.toLowerCase().includes(value));

    setInput(e.target.value);
    setDedicatedLangs(filtered);
  }

  return (
    <div className={`yate-relative ${className}`}>
      <input
        type="text"
        className="!yate-border !yate-border-gray-300 !yate-rounded !yate-px-2 !yate-py-1 !yate-text-sm yate-w-full !yate-min-w-full !yate-bg-transparent yate-max-h-8 !yate-m-0 yate-transition yate-box-border focus:yate-outline-none focus:!yate-shadow-none focus:!yate-border-blue-400 dark:!yate-text-gray-200 dark:!yate-border-gray-700 dark:focus:!yate-border-blue-400"
        placeholder={i18n.getMessage('placeholderSelectLanguage')}
        defaultValue={selectedLangName}
        value={typing ? input : selectedLangName}
        onFocus={toggleDropdown}
        onBlur={toggleDropdown}
        onInput={filterLanguage}
      />
      <div className="yate-absolute yate-box-border yate-left-0 yate-top-6 yate-w-full yate-rounded-b yate-shadow-md yate-bg-white yate-max-h-40 yate-overflow-hidden yate-z-10 yate-border yate-border-t-0 !yate-border-solid !yate-border-blue-400 yate-hidden dark:yate-bg-gray-900"
        ref={dropdown}>
        <ul className="yate-py-1 yate-box-border yate-max-h-40 yate-overflow-y-auto has-scrollbar yate-text-sm yate-m-0">
          {
            dedicatedLangs.map((name) => <li key={name}
              className="yate-w-full yate-box-border yate-whitespace-nowrap yate-py-1 5 yate-px-4 yate-cursor-default yate-transition-colors hover:yate-bg-blue-400 hover:yate-text-gray-50 dark:yate-text-gray-200 dark:hover:yate-bg-blue-600"
              data-lang-code={langs[name]}
              onMouseDown={selectLang}>{name}</li>)
          }
        </ul>
      </div>
    </div>
  );
}