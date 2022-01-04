import 'tailwindcss/tailwind.css';
import { Fragment, h, render } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { runtime } from 'webextension-polyfill';

import './common/fonts';
import './common/scrollbar';
import appIcon from '../res/icons/48.png';
import Article from './components/Article';
import LanguageSelection from './components/LanguageSelection';
import useSettings from './hooks/useSettings';
import useTranslation from './hooks/useTranslation';

function MainPanel() {
  /** @type import('preact/hooks').MutableRef<HTMLElement> */
  const root = useRef(null);
  /** @type import('preact/hooks').MutableRef<HTMLElement> */
  const popBtn = useRef(null);
  /** @type import('preact/hooks').MutableRef<HTMLElement> */
  const popPanel = useRef(null);
  const [options] = useSettings();
  const [translation, setTranslation] = useState({});
  const setResult = useCallback((result) => setTranslation(result ? result : {}), []);
  const {
    setSourceLang,
    setTargetLang,
    setText,
    sourceLang,
    targetLang,
    text,
  } = useTranslation(setResult);
  const showTranslationPanel = useCallback((e, selectedText = window.getSelection().toString()
    .trim()) => {

    options.translateWithButton && popBtn.current.classList.add('hidden');

    setText(selectedText);

    popPanel.current.style.setProperty('left', `${e.pageX}px`);
    popPanel.current.style.setProperty('top', `${e.pageY}px`);
    popPanel.current.classList.remove('hidden');
  }, [options.translateWithButton, setText]);

  useEffect(() => {

    /** @param {MouseEvent} e */
    function showTranslationPopup(e) {

      if (null !== e.target.closest('#yate')) return;

      const selectedText = window.getSelection().toString()
        .trim();

      if ('' === selectedText) {

        popBtn.current.classList.add('hidden');
        popPanel.current.classList.add('hidden');
        return;
      }

      if (options.translateWithButton) {
        showTranslationButton(e);
      }
      else {
        showTranslationPanel(e, selectedText);
      }
    }

    /** @param {MouseEvent} e */
    function showTranslationButton(e) {
      popBtn.current.style.setProperty('left', `${e.pageX}px`);
      popBtn.current.style.setProperty('top', `${e.pageY}px`);
      popBtn.current.classList.remove('hidden');
    }

    document.addEventListener('mouseup', showTranslationPopup, false);

    return () => document.removeEventListener('mouseup', showTranslationPopup, false);
  }, [options.translateWithButton, showTranslationPanel]);

  return (
    <div id="yate"
      ref={root}
      className={options.darkTheme ? 'dark' : ''}>
      {options.translateWithButton &&
        <img ref={popBtn}
          src={runtime.getURL(appIcon)}
          className="absolute cursor-pointer overflow-hidden border border-gray-300 rounded-sm w-6 h-6 z-max p-0.5 bg-white hidden dark:bg-gray-900"
          onClick={showTranslationPanel}
        />}
      <div ref={popPanel}
        className="absolute w-64 h-64 overflow-hidden bg-white rounded shadow z-max text-base text-gray-800 hidden dark:bg-gray-900 dark:shadow-dark">
        <div className="shadow">
          <LanguageSelection className="p-2"
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang} />
        </div>
        <div className="has-scrollbar overflow-auto py-3"
          style={{ maxHeight: 'calc(100% - 2.75rem)' }}>
          <Article text={text}
            smallText={translation.spelling}
            className="mb-2"
            lang={sourceLang} />
          <Article text={translation.trans}
            className="mb-2"
            lang={targetLang} />
          {translation.synonyms &&
            translation.synonyms.map(({ type, terms }) => (
              <Fragment key={type}>
                <p className="text-sm pl-2 text-blue-400 font-bold">{type}</p>
                {terms.map(({ word, reverseTranslation }, i) =>
                  <Article key={word}
                    text={word}
                    smallText={reverseTranslation}
                    lang={targetLang}
                    className={i === terms.length - 1 ? '' : 'mb-2'} />)}
              </Fragment>
            ))}
        </div>
      </div>
    </div>
  );
}

render(<MainPanel />, document.body);