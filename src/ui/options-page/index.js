import '../common/base.css';
import '../common/fonts.css';

import { runtime } from 'webextension-polyfill';

import '../components/button-link.js';
import '../components/preferences.js';

const versionTag = document.getElementById('version');

versionTag.textContent = runtime.getManifest().version;
