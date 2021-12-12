import { useEffect, useRef, useState } from 'preact/hooks';
import { h } from 'preact';

import '../common/scrollbar';
import { langs } from '../../background/api';

export default function ComboBox({ className, selectedLang, onLangChange }) {
  const dropdown = useRef(null);
  const langNames = ['Auto detection'].concat(Object.keys(langs).sort());
  const [dedicatedLangs, setDedicatedLangs] = useState(langNames);
  const [selectedLangName, setSelectedLangName] = useState('');

  useEffect(() => {

    if ('auto' === selectedLang) {

      setSelectedLangName('Auto detection');
      return;
    }

    for (const lang in langs) {
      if (langs.hasOwnProperty(lang) && langs[lang] === selectedLang) {
        setSelectedLangName(lang);
        break;
      }
    }
  }, [selectedLang]);

  /** @param {Event} e */
  function toggleDropdown(e) {
    dropdown.current.classList.toggle('hidden');
  }

  function selectLang(e) {
    onLangChange(e.target.dataset.langCode || 'auto');
  }

  function filterLanguage(e) {
    const value = e.target.value.trim().toLowerCase();
    const filtered = langNames.filter((lang) => lang.toLowerCase().includes(value));

    setSelectedLangName(e.target.value);
    setDedicatedLangs(filtered);
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        className="border border-gray-300 rounded px-2 py-1 text-sm w-full transition focus:outline-none focus:border-blue-400"
        value={selectedLangName}
        onFocus={toggleDropdown}
        onBlur={toggleDropdown}
        onInput={filterLanguage}
      />
      <div className="absolute left-0 top-6 w-full rounded-b shadow-md bg-white max-h-40 overflow-hidden z-10 border-b border-r border-l border-blue-400 hidden"
        ref={dropdown}>
        <ul className="py-1 max-h-40 overflow-y-auto has-scrollbar">
          {
            dedicatedLangs.map((name) => <li key={name}
              className="w-full whitespace-nowrap py-1 5 px-4 cursor-default transition-colors hover:bg-blue-400 hover:text-gray-50"
              data-lang-code={langs[name]}
              onMouseDown={selectLang}>{name}</li>)
          }
        </ul>
      </div>
    </div>
  );
}