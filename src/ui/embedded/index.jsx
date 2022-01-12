import 'tailwindcss/tailwind.css';
import { Fragment, h, render } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { runtime } from 'webextension-polyfill';

import '../common/fonts';
import '../common/scrollbar';
import appIcon from '../../res/icons/48.png';
import Article from '../components/Article';
import LanguageSelection from '../components/LanguageSelection';
import { useBackgroundTranslation } from '../hooks/useTranslation';
import useSettings from '../hooks/useSettings';

function MainPanel() {

  /** @type import('preact/hooks').MutableRef<HTMLElement> */
  const popBtn = useRef(null);
  /** @type import('preact/hooks').MutableRef<HTMLElement> */
  const popPanel = useRef(null);
  const [options, setOptions] = useSettings();
  const { result, text, setText, sourceLang, setSourceLang, targetLang, setTargetLang } = useBackgroundTranslation();
  const showTranslationPanel = useCallback((e) => {

    options.translateWithButton && popBtn.current.classList.add('yate-hidden');
    popPanel.current.style.setProperty('left', `${e.pageX}px`);
    popPanel.current.style.setProperty('top', `${e.pageY}px`);
    popPanel.current.classList.remove('yate-hidden');
  }, [options.translateWithButton]);
  const [timer, setTimer] = useState(null);

  useEffect(() => {

    function onReceiveMessage(message) {
      setOptions((prevOptions) => ({ ...prevOptions, ...message.options }));
    }

    runtime.onMessage.addListener(onReceiveMessage);

    return () => runtime.onMessage.removeListener(onReceiveMessage);
  }, []);

  useEffect(() => {

    const style = document.createElement('style');
    style.innerText = `@font-face {
    font-family: 'Nunito';
    font-style: normal;
    font-weight: 400;
    src: url(${runtime.getURL('res/fonts/Nunito-400.woff2')}) format('woff2');
  }

  @font-face {
    font-family: 'Nunito';
    font-style: normal;
    font-weight: 700;
    src: url(${runtime.getURL('res/fonts/Nunito-700.woff2')}) format('woff2');
  }

  @font-face {
    font-family: 'icomoon';
    src: url(${runtime.getURL('res/fonts/icomoon.woff')}) format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }`.replace(/\s|\n/g, '');

    document.head.append(style);
  }, []);

  useEffect(() => {

    if (options.darkTheme) {
      root.classList.add('yate-dark');
    }
    else {
      root.classList.remove('yate-dark');
    }
  }, [options.darkTheme]);

  useEffect(() => {

    /** @param {MouseEvent} e */
    function showPopup(e) {

      if (null !== e.target.closest('#yate')) return;

      const selectedText = window.getSelection().toString()
        .trim();

      setText(selectedText);

      if ('' === selectedText) {

        options.translateWithButton && popBtn.current.classList.add('yate-hidden');
        popPanel.current.classList.add('yate-hidden');

        if (timer) {

          clearTimeout(timer);
          setTimer(null);
        }

        return;
      }

      if (options.translateWithButton) {

        showTranslationButton(e);

        if (timer) {

          clearTimeout(timer);
          setTimer(null);
        }

        const timeout = setTimeout(() => options.translateWithButton && popBtn.current.classList.add('yate-hidden')
          , 2000);
        setTimer(timeout);
      }
      else {
        showTranslationPanel(e);
      }
    }

    /** @param {MouseEvent} e */
    function showTranslationButton(e) {
      popBtn.current.style.setProperty('left', `${e.pageX}px`);
      popBtn.current.style.setProperty('top', `${e.pageY}px`);
      popBtn.current.classList.remove('yate-hidden');
    }

    document.addEventListener('mouseup', showPopup, false);

    return () => document.removeEventListener('mouseup', showPopup, false);
  }, [options.translateWithButton, setText, showTranslationPanel, timer]);

  return (
    <Fragment>
      {options.translateWithButton &&
        <img ref={popBtn}
          src={runtime.getURL(appIcon)}
          className="yate-absolute yate-cursor-pointer yate-overflow-hidden yate-border yate-border-gray-300 yate-rounded-sm yate-w-6 yate-h-6 yate-z-max yate-p-0.5 yate-bg-white yate-hidden dark:yate-bg-gray-900"
          onClick={showTranslationPanel}
        />}
      <div ref={popPanel}
        className="yate-absolute yate-w-64 yate-max-h-64 yate-overflow-hidden yate-bg-white yate-rounded yate-shadow yate-z-max yate-text-base yate-text-gray-800 yate-hidden dark:yate-bg-gray-900 dark:yate-shadow-dark">
        <div className="yate-shadow">
          <LanguageSelection className="yate-p-2"
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang} />
        </div>
        <div className="has-scrollbar yate-overflow-auto yate-py-3"
          style={{ maxHeight: 'calc(16rem - 2.75rem)' }}>
          {result.error && <p className="yate-text-sm yate-text-gray-600 dark:yate-text-gray-300 yate-px-3 yate-m-0">{result.error}</p>}
          {result.spelling && <Article text={text}
            smallText={result.spelling}
            className="yate-mb-2"
            lang={sourceLang} />}
          {result.trans && <Article text={result.trans}
            className="yate-mb-2"
            lang={targetLang} />}
          {result.synonyms &&
            result.synonyms.map(({ type, terms }) => (
              <Fragment key={type}>
                <p className="yate-text-sm yate-pl-2 yate-text-blue-400 yate-font-bold yate-mb-1">{type}</p>
                {terms.map(({ word, reverseTranslation }, i) =>
                  <Article key={word}
                    text={word}
                    smallText={reverseTranslation}
                    lang={targetLang}
                    className={i === terms.length - 1 ? '' : 'yate-mb-2'} />)}
              </Fragment>
            ))}
        </div>
      </div>
    </Fragment>
  );
}

const root = document.createElement('div');
root.id = 'yate';

document.body.append(root);
render(<MainPanel />, root);