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
    dropdown.current.classList.toggle('hidden');
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
    <div className={`relative ${className}`}>
      <input
        type="text"
        className="border border-gray-300 rounded px-2 py-1 text-sm w-full bg-transparent max-h-8 transition focus:outline-none focus:border-blue-400 dark:text-gray-200 dark:border-gray-700 dark:focus:border-blue-400"
        placeholder={i18n.getMessage('placeholderSelectLanguage')}
        defaultValue={selectedLangName}
        value={typing ? input : selectedLangName}
        onFocus={toggleDropdown}
        onBlur={toggleDropdown}
        onInput={filterLanguage}
      />
      <div className="absolute left-0 top-6 w-full rounded-b shadow-md bg-white max-h-40 overflow-hidden z-10 border-b border-r border-l border-blue-400 hidden dark:bg-gray-900"
        ref={dropdown}>
        <ul className="py-1 max-h-40 overflow-y-auto has-scrollbar text-sm">
          {
            dedicatedLangs.map((name) => <li key={name}
              className="w-full whitespace-nowrap py-1 5 px-4 cursor-default transition-colors hover:bg-blue-400 hover:text-gray-50 dark:text-gray-200 dark:hover:bg-blue-600"
              data-lang-code={langs[name]}
              onMouseDown={selectLang}>{name}</li>)
          }
        </ul>
      </div>
    </div>
  );
}