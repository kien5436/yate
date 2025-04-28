// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import logger from './logger.mjs';

/**
 * @param {string} assetsPath
 * @param {'firefox' | 'chromium'} browser
 */
export default async function(assetsPath, browser) {

  const manifest = {
    manifest_version: 3,
    name: '__MSG_extensionName__',
    description: '__MSG_description__',
    author: 'Phạm Trung Kiên',
    icons: {
      48: 'res/icons/48.png',
      96: 'res/icons/96.png',
      128: 'res/icons/128.png',
    },
    default_locale: 'en',
    permissions: [
      'storage',
      'tabs',
      'contextMenus',
    ],
    host_permissions: ['<all_urls>'],
    action: {
      default_icon: 'res/icons/48.png',
      default_title: '__MSG_extensionName__',
      default_popup: 'popup.html',
    },
    background: { scripts: null },
    content_scripts: [
      {
        all_frames: true,
        js: null,
        matches: ['*://*/*'],
        run_at: 'document_end',
      },
    ],
    options_ui: {
      open_in_tab: true,
      page: 'options.html',
    },
    web_accessible_resources: [
      {
        resources: ['res/*'],
        matches: ['*://*/*'],
      },
    ],
    commands: {
      _execute_browser_action: { description: '__MSG_openPopup__' },
      translateSelectedText: { description: '__MSG_translateSelectedText__' },
      translateFullPage: { description: '__MSG_translateFullPage__' },
    },
    version: '2.0.0',
  };
  const absolutePath = resolve(assetsPath);

  try {
    const data = await readFile(absolutePath, 'utf8');

    /** @type {{background: string[], embedded: string[]}} */
    const assets = JSON.parse(data);

    manifest.background.scripts = assets.background;
    manifest.web_accessible_resources.push({
      resources: assets.embedded.filter((file) => file.endsWith('css')),
      matches: ['*://*/*'],
    });
    manifest.content_scripts[0].js = assets.embedded.filter((file) => file.endsWith('js'));

    if ('firefox' === browser)
      manifest.browser_specific_settings = {
        gecko: {
          id: 'yate@kien5436.com',
          strict_min_version: '109.0',
        },
      };
    else
      manifest.minimum_chrome_version = '92.0';

    await writeFile(resolve(dirname(absolutePath), './yate/manifest.json'), JSON.stringify(manifest), 'utf8');

    const date = new Date();
    const now = new Date(date.getTime() + date.getTimezoneOffset() * 6e4 + 36e5 * 7);
    const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();

    logger('info', `${10 > hour ? `0${hour}` : hour}:${10 > min ? `0${min}` : min}:${10 > sec ? `0${sec}` : sec}`, 'manifest is generated');
  }
  catch (err) {
    logger('error', err);
  }
}
