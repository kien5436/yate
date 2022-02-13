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

function computeTooltipPosition(tooltipWidth, tooltipHeight) {
  const { x, y, width, height } = window.getSelection().getRangeAt(0)
    .getBoundingClientRect();

  return {
    left: parseInt(x + window.scrollX + width / 2 - tooltipWidth / 2, 10),
    top: parseInt(y + window.scrollY + (y + window.scrollY + tooltipHeight + 10 >= document.documentElement.scrollHeight ? -10 - tooltipHeight : height + 10), 10),
  };
}

function Tooltip() {

  /** @type import('preact/hooks').MutableRef<HTMLElement> */
  const popBtn = useRef(null);
  /** @type import('preact/hooks').MutableRef<HTMLElement> */
  const popPanel = useRef(null);
  const [timer, setTimer] = useState(null);
  const [scale, setScale] = useState(1);
  const [options, setOptions] = useSettings();
  const [port] = useState(runtime.connect);
  const { result, text, setText, sourceLang, setSourceLang, targetLang, setTargetLang } = useBackgroundTranslation(port);
  const showTranslationPanel = useCallback(() => {

    const { left, top } = computeTooltipPosition(panelSize, panelSize);
    const selectedText = window.getSelection().toString()
      .trim();
    setText(selectedText);

    options.translateWithButton && popBtn.current.classList.add('yate-hidden');
    popPanel.current.style.setProperty('left', `${left}px`);
    popPanel.current.style.setProperty('top', `${top}px`);
    popPanel.current.style.setProperty('transform', `scale(${scale})`);
    popPanel.current.classList.remove('yate-hidden');
  }, [options.translateWithButton, scale]);
  const btnSize = 24;
  const panelSize = 256;

  useEffect(() => {

    function onReceiveMessage(message) {

      if (message.options) {

        setOptions((prevOptions) => ({ ...prevOptions, ...message.options }));
      }
      else if ('showTranslationPanel' === message.action) {

        showTranslationPanel();
      }
    }

    runtime.onMessage.addListener(onReceiveMessage);

    return () => runtime.onMessage.removeListener(onReceiveMessage);
  }, [showTranslationPanel]);

  useEffect(() => {

    const style = document.createElement('style');
    const rootFontSize = parseFloat(window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size'));
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
    setScale(16 / rootFontSize);
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

      options.translateWithButton && popBtn.current.classList.add('yate-hidden');
      popPanel.current.classList.add('yate-hidden');
      setText('');
      port.postMessage({ action: 'stop' });

      if (timer) {

        clearTimeout(timer);
        setTimer(null);
      }

      if ('' === selectedText) {
        return;
      }

      if (options.translateWithButton) {

        showTranslationButton();

        const timeout = setTimeout(() => options.translateWithButton && popBtn.current.classList.add('yate-hidden')
          , 2000);
        setTimer(timeout);
      }
      else {
        showTranslationPanel();
      }
    }

    function showTranslationButton() {

      const { left, top } = computeTooltipPosition(btnSize, btnSize);

      popBtn.current.style.setProperty('left', `${left}px`);
      popBtn.current.style.setProperty('top', `${top}px`);
      popBtn.current.style.setProperty('transform', `scale(${scale})`);
      popBtn.current.classList.remove('yate-hidden');
    }

    document.addEventListener('mouseup', showPopup, false);

    return () => document.removeEventListener('mouseup', showPopup, false);
  }, [options.translateWithButton, port, scale, showTranslationPanel, timer]);

  return (
    <Fragment>
      {options.translateWithButton &&
        <img ref={popBtn}
          src={runtime.getURL(appIcon)}
          className="yate-absolute yate-cursor-pointer yate-overflow-hidden yate-border yate-border-gray-300 yate-rounded-sm yate-w-6 yate-h-6 yate-z-max yate-p-0.5 yate-bg-white yate-origin-top-left yate-box-border yate-hidden dark:yate-bg-gray-900"
          onClick={showTranslationPanel}
        />}
      <div ref={popPanel}
        className="yate-absolute yate-w-64 yate-max-h-64 yate-overflow-hidden yate-bg-white yate-rounded yate-shadow yate-z-max yate-text-base yate-text-gray-800 yate-origin-top-left yate-box-border yate-hidden dark:yate-bg-gray-900 dark:yate-shadow-dark"
      >
        <div className="yate-shadow">
          <LanguageSelection className="yate-p-2 yate-box-border"
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang} />
        </div>
        <div className="has-scrollbar yate-overflow-auto yate-py-3 yate-box-border"
          style={{ maxHeight: 'calc(16rem - 2.75rem)' }}>
          {result.error && <p className="yate-text-sm yate-text-gray-600 yate-box-border dark:yate-text-gray-300 yate-px-3 yate-m-0">{result.error}</p>}
          {text && <Article
            port={port}
            text={text}
            smallText={result.spelling}
            className="yate-mb-2 last:yate-mb-0"
            lang={sourceLang} />}
          {result.trans && <Article
            port={port}
            text={result.trans}
            className="yate-mb-2 last:yate-mb-0"
            lang={targetLang} />}
          {result.synonyms &&
            result.synonyms.map(({ type, terms }) => (
              <Fragment key={type}>
                <p className="yate-text-sm yate-pl-2 yate-text-blue-400 yate-font-bold yate-mb-1 yate-box-border">{type}</p>
                {terms.map(({ word, reverseTranslation }) =>
                  <Article
                    port={port}
                    key={word}
                    text={word}
                    smallText={reverseTranslation}
                    lang={targetLang}
                    className='yate-mb-2 last:yate-mb-0' />)}
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
render(<Tooltip />, root);