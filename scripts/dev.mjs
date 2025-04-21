import webExt from 'web-ext';

import { watch } from './webpack-builder.mjs';
import logger from './logger.mjs';
import buildManifest from './manifest-builder.mjs';

/**
 * Thank to https://stackoverflow.com/a/54098693
 *
 * For this minimal process, there is 1 option only:
 *
 * `--browser`:  'firefox' or 'chromium'
 *
 * @example
 * ```
 * node ./scripts/dev.mjs --browser=firefox
 * ```
 *
 * @return {{browser: 'firefox' | 'chromium' | undefined}}
 */
function parseArgs() {

  const args = {};

  process.argv
    .slice(2, process.argv.length)
    .forEach((arg) => {

      // long arg
      if ('--' === arg.slice(0, 2)) {

        const longArg = arg.split('=');
        const longArgFlag = longArg[0].slice(2, longArg[0].length);
        const longArgValue = 1 < longArg.length ? longArg[1] : true;

        args[longArgFlag] = longArgValue;
      }
    });

  return args;
}

try {
  const args = parseArgs();

  if (args.browser === undefined)
    throw new Error('Missing --browser arg. Available options: "firefox", "chromium"');

  let browserStarted = false;
  let extensionRunner = null;
  const webpackWatcher = watch(async () => {
    await buildManifest('dist/assets.json', args.browser);

    if ('firefox' === args.browser) // lint firefox only because web-ext requires extension id while chromium doesn't
      await webExt.cmd.lint({ sourceDir: 'dist/yate' }, { shouldExitProgram: false });

    if (!browserStarted) {

      const runOptions = {
        devtools: false,
        noInput: true,
        sourceDir: 'dist/yate',
      };

      if ('firefox' === args.browser) {
        runOptions.firefox = 'deved';
        runOptions.firefoxProfile = 'dev';
      }
      else {
        runOptions.target = 'chromium';
        runOptions.chromiumBinary = '/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev';
      }

      extensionRunner = await webExt.cmd.run(runOptions, { shouldExitProgram: false });
      // eslint-disable-next-line require-atomic-updates
      browserStarted = true;
    }
  });

  process.on('SIGINT', () => {

    webpackWatcher.close(() => { logger('info', 'webpack watcher closed') });

    if (extensionRunner)
      extensionRunner.exit();

    process.exit(0);
  });
}
catch (err) {
  logger('error', err);

  process.exit(1);
}
