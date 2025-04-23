import { runtime } from 'webextension-polyfill';

import '../common/base.css';
import '../common/fonts.css';
import '../components/button-link.js';
import '../components/preferences-pane.js';
import { extensionUrl } from '../../settings.js';

const versionTag = document.getElementById('version');
const btnLinkStar = document.querySelector('button-link[icon="feather-star-empty"]');

versionTag.textContent = runtime.getManifest().version;
btnLinkStar.setAttribute('href', extensionUrl);
