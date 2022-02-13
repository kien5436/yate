/* eslint-disable sort-keys */
// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

const { watch } = require('chokidar');
const { readFile, writeFile } = require('fs/promises');

const manifest = {
  manifest_version: 2,
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
    '<all_urls>',
    'storage',
    'tabs',
    'contextMenus',
  ],
  browser_action: {
    default_icon: 'res/icons/48.png',
    default_title: '__MSG_extensionName__',
    default_popup: 'popup.html',
  },
  background: { scripts: null },
  content_scripts: [{
    all_frames: true,
    css: null,
    js: null,
    matches: [
      '*://*/*',
    ],
    run_at: 'document_end',
  }],
  options_ui: {
    open_in_tab: true,
    page: 'options.html',
  },
  web_accessible_resources: [
    'res/*',
  ],
  commands: {
    _execute_browser_action: { description: '__MSG_openPopup__' },
    translateSelectedText: { description: '__MSG_translateSelectedText__' },
    translateFullPage: { description: '__MSG_translateFullPage__' },
  },
  version: '1.1.5',
};

console.log('\x1b[1m\x1b[34m%s\x1b[0m', 'Watching for assets changes');

watch('./assets.json', { interval: 5000 })

  .on('change', async (path) => {

    try {
      let data = '';

      do {
        // eslint-disable-next-line no-await-in-loop
        data = await readFile(path, 'utf8');
      } while ('' === data);

      /** @type {{background: string[], embedded: string[]}} */
      const assets = JSON.parse(data);
      manifest.background.scripts = assets.background;
      manifest.content_scripts[0].css = assets.embedded.filter((file) => file.endsWith('css'));
      manifest.content_scripts[0].js = assets.embedded.filter((file) => file.endsWith('js'));

      if ('firefox' === process.env.BROWSER) {
        manifest.browser_specific_settings = {
          gecko: {
            id: 'yate@kien5436.com',
            strict_min_version: '90.0',
          },
        };
      }
      else {
        manifest.minimum_chrome_version = '92.0';
      }

      await writeFile('./yate/manifest.json', JSON.stringify(manifest), 'utf8');

      const date = new Date();
      const now = new Date(date.getTime() + date.getTimezoneOffset() * 6e4 + 36e5 * 7);
      const hour = now.getHours();
      const min = now.getMinutes();
      const sec = now.getSeconds();

      console.log('\x1b[0m%s\x1b[34m %s\x1b[0m', `${10 > hour ? `0${hour}` : hour}:${10 > min ? `0${min}` : min}:${10 > sec ? `0${sec}` : sec}`, 'manifest is generated');
    }
    catch (err) {
      console.error('\x1b[1m\x1b[31m%s \x1b[0m%s', err.name, err.message);
    }
  })
  .on('error', (err) => console.error(err));