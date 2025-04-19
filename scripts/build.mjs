import webExt from 'web-ext';

import { build } from './webpack-builder.mjs';
import logger from './logger.mjs';
import buildManifest from './manifest-builder.mjs';

/**
  * @param {'firefox' | 'chromium'} browser
  */
async function buildFor(browser) {
  await buildManifest('dist/assets.json', browser);

  if ('firefox' === browser)
    await webExt.cmd.lint({ sourceDir: 'dist/yate' }, { shouldExitProgram: false });

  await webExt.cmd.build({
    sourceDir: 'dist/yate',
    artifactsDir: 'dist',
    overwriteDest: true,
    filename: `{name}-${browser}-{version}.zip`,
  }, { shouldExitProgram: false });
}

build(async () => {
  await buildFor('firefox');
  await buildFor('chromium');

  logger('info', 'built successfully');
});
