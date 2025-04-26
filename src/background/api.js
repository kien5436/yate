import { tabs as browserTabs } from 'webextension-polyfill';

const TRANSLATION_URL = 'https://translate.googleapis.com/translate_a/single?';
const FALLBACK_TRANSLATION_URL = 'https://clients5.google.com/translate_a/t?';
const TTS_URL = 'https://translate.google.com/translate_tts?';
const PAGE_TRANSLATION_URL = 'https://translate.google.com/translate?';

export const langs = {
  Afrikaans: 'af',
  Albanian: 'sq',
  Amharic: 'am',
  Arabic: 'ar',
  Armenian: 'hy',
  'Auto detection': 'auto',
  Azerbaijani: 'az',
  Basque: 'eu',
  Belarusian: 'be',
  Bengali: 'bn',
  Bosnian: 'bs',
  Bulgarian: 'bg',
  Catalan: 'ca',
  Cebuano: 'ceb',
  Chichewa: 'ny',
  Chinese: 'zh-CN',
  Corsican: 'co',
  Croatian: 'hr',
  Czech: 'cs',
  Danish: 'da',
  Dutch: 'nl',
  English: 'en',
  Esperanto: 'eo',
  Estonian: 'et',
  Filipino: 'tl',
  Finnish: 'fi',
  French: 'fr',
  Frisian: 'fy',
  Galician: 'gl',
  Georgian: 'ka',
  German: 'de',
  Greek: 'el',
  Gujarati: 'gu',
  'Haitian Creole': 'ht',
  Hausa: 'ha',
  Hawaiian: 'haw',
  Hebrew: 'iw',
  Hindi: 'hi',
  Hmong: 'hmn',
  Hungarian: 'hu',
  Icelandic: 'is',
  Igbo: 'ig',
  Indonesian: 'id',
  Irish: 'ga',
  Italian: 'it',
  Japanese: 'ja',
  Javanese: 'jw',
  Kannada: 'kn',
  Kazakh: 'kk',
  Khmer: 'km',
  Kinyarwanda: 'rw',
  Korean: 'ko',
  'Kurdish (Kurmanji)': 'ku',
  Kyrgyz: 'ky',
  Lao: 'lo',
  Latin: 'la',
  Latvian: 'lv',
  Lithuanian: 'lt',
  Luxembourgish: 'lb',
  Macedonian: 'mk',
  Malagasy: 'mg',
  Malay: 'ms',
  Malayalam: 'ml',
  Maltese: 'mt',
  Maori: 'mi',
  Marathi: 'mr',
  Mongolian: 'mn',
  'Myanmar (Burmese)': 'my',
  Nepali: 'ne',
  Norwegian: 'no',
  'Odia (Oriya)': 'or',
  Pashto: 'ps',
  Persian: 'fa',
  Polish: 'pl',
  Portuguese: 'pt',
  Punjabi: 'pa',
  Romanian: 'ro',
  Russian: 'ru',
  Samoan: 'sm',
  'Scots Gaelic': 'gd',
  Serbian: 'sr',
  Sesotho: 'st',
  Shona: 'sn',
  Sindhi: 'sd',
  Sinhala: 'si',
  Slovak: 'sk',
  Slovenian: 'sl',
  Somali: 'so',
  Spanish: 'es',
  Sundanese: 'su',
  Swahili: 'sw',
  Swedish: 'sv',
  Tajik: 'tg',
  Tamil: 'ta',
  Tatar: 'tt',
  Telugu: 'te',
  Thai: 'th',
  Turkish: 'tr',
  Turkmen: 'tk',
  Ukrainian: 'uk',
  Urdu: 'ur',
  Uyghur: 'ug',
  Uzbek: 'uz',
  Vietnamese: 'vi',
  Welsh: 'cy',
  Xhosa: 'xh',
  Yiddish: 'yi',
  Yoruba: 'yo',
  Zulu: 'zu',
};

export const reversedLangs = {
  af: 'Afrikaans',
  sq: 'Albanian',
  am: 'Amharic',
  ar: 'Arabic',
  hy: 'Armenian',
  auto: 'Auto detection',
  az: 'Azerbaijani',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali',
  bs: 'Bosnian',
  bg: 'Bulgarian',
  ca: 'Catalan',
  ceb: 'Cebuano',
  ny: 'Chichewa',
  'zh-CN': 'Chinese',
  co: 'Corsican',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  en: 'English',
  eo: 'Esperanto',
  et: 'Estonian',
  tl: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  fy: 'Frisian',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  ha: 'Hausa',
  haw: 'Hawaiian',
  iw: 'Hebrew',
  hi: 'Hindi',
  hmn: 'Hmong',
  hu: 'Hungarian',
  is: 'Icelandic',
  ig: 'Igbo',
  id: 'Indonesian',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  jw: 'Javanese',
  kn: 'Kannada',
  kk: 'Kazakh',
  km: 'Khmer',
  rw: 'Kinyarwanda',
  ko: 'Korean',
  ku: 'Kurdish (Kurmanji)',
  ky: 'Kyrgyz',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  lt: 'Lithuanian',
  lb: 'Luxembourgish',
  mk: 'Macedonian',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  mi: 'Maori',
  mr: 'Marathi',
  mn: 'Mongolian',
  my: 'Myanmar (Burmese)',
  ne: 'Nepali',
  no: 'Norwegian',
  or: 'Odia (Oriya)',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  pa: 'Punjabi',
  ro: 'Romanian',
  ru: 'Russian',
  sm: 'Samoan',
  gd: 'Scots Gaelic',
  sr: 'Serbian',
  st: 'Sesotho',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish',
  su: 'Sundanese',
  sw: 'Swahili',
  sv: 'Swedish',
  tg: 'Tajik',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  tk: 'Turkmen',
  uk: 'Ukrainian',
  ur: 'Urdu',
  ug: 'Uyghur',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  cy: 'Welsh',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zu: 'Zulu',
};

export const ERROR_BLOCKED_BY_SERVER = 1;

export const MAX_TEXT_LEN = 20000;

/**
 * @param {string} text
 * @param {string} sourceLang
 * @param {string} targetLang
 */
export async function translate(text, sourceLang = 'auto', targetLang = 'vi') {

  if ('' === text) return null;

  let res = await fetch(buildRequestUrl(text, sourceLang, targetLang), buildRequestOptions());

  if (200 === res.status) {
    const data = await res.json();

    return getResult(data);
  }

  res = await fetch(buildRequestUrl(text, sourceLang, targetLang, true), buildRequestOptions(true));

  if (200 === res.status) {
    const data = await res.json();

    return getResult(data);
  }

  throw error();
}

export function openInGoogleTranslate(pageUrl, targetLang = 'vi') {
  const params = new URLSearchParams({
    hl: targetLang,
    sl: 'auto',
    tl: targetLang,
    u: pageUrl,
  }).toString();

  browserTabs.update({ url: PAGE_TRANSLATION_URL + params }).catch((err) => console.error('api.js:155', err));
}

/**
 * @param {string} text
 * @param {string} targetLang
 */
export async function tts(text, targetLang) {

  if ('' === text) return null;

  const params = new URLSearchParams({
    client: 'dict-chrome-ex',
    idx: 0,
    ie: 'UTF-8',
    prev: 'input',
    q: text,
    textlen: text.length,
    tl: targetLang,
    total: text.split(' ').length,
    ttsspeed: 1,
  }).toString();

  const res = await fetch(TTS_URL + params, {
    credentials: 'omit',
    headers: {
      Accept: '*/*',
      'Alt-Used': 'translate.google.com',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': navigator.userAgent,
    },
    method: 'GET',
  });

  if (200 === res.status)
    return await res.blob();

  throw error();
}

function buildRequestOptions(fallback = false) {
  return {
    credentials: 'omit',
    headers: {
      Accept: '*/*',
      'Alt-Used': fallback ? 'clients5.google.com' : 'translate.googleapis.com',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': navigator.userAgent,
    },
    method: 'GET',
  };
}

function buildRequestUrl(text, sourceLang, targetLang, fallback = false) {
  const params = new URLSearchParams({
    client: fallback ? 'dict-chrome-ex' : 'gtx',
    hl: 'en',
    q: text,
    sl: sourceLang,
    tl: targetLang,
  });

  if (fallback) {
    params.append('ie', 'UTF-8');
    params.append('oe', 'UTF-8');
    params.append('tbb', 1);
  }
  else {
    params.append('dj', 1);
    params.append('dt', 't');
    params.append('dt', 'bd');
    params.append('dt', 'qc');
    params.append('dt', 'rm');
    params.append('dt', 'ex');
  }

  return `${fallback ? FALLBACK_TRANSLATION_URL : TRANSLATION_URL}${params.toString()}`;
}

/**
 * @typedef {{
 *  trans: string,
 *  spelling: string,
 *  synonyms: Array<{
 *    type: string,
 *    terms: Array<{
 *      word: string,
 *      reverseTranslation: string
 *    }>
 *  }>,
 *  sourceLang: string
 * }} TranslationResult;
 */
/**
 * @param {object} data JSON-object
 */
function getResult(data) {

  const { sentences, dict, ld_result: { srclangs } } = data;
  /** @type {TranslationResult} */
  const result = { sourceLang: srclangs[0] };

  if (undefined === dict) {
    let trans = '';

    for (let i = 0; i < sentences.length; i++) {

      trans += sentences[i].trans || '';
      result.spelling = sentences[i].src_translit && `/${sentences[i].src_translit}/`;
    }

    result.trans = trans;

    return result;
  }

  const synonyms = [];

  for (const item of dict) {

    const terms = [];

    for (let i = 0; i < item.entry.length; i++) {

      const entry = item.entry[i];

      terms.push({
        reverseTranslation: entry.reverse_translation.join(', '),
        word: entry.word,
      });
    }

    synonyms.push({
      terms,
      type: item.pos,
    });
  }

  result.synonyms = synonyms;
  result.trans = sentences[0].trans;
  result.spelling = sentences[1] && `/${sentences[1].src_translit}/`;

  return result;
}

function error() {

  const err = new Error('Blocked for requesting too much');

  err.code = ERROR_BLOCKED_BY_SERVER;

  return err;
}
