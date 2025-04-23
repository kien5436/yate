import webpack from 'webpack';

import config from '../webpack.config.mjs';
import logger from './logger.mjs';

/**
 * @param {() => void | undefined} callback
 */
export function watch(callback) {

  const compiler = webpack(config);

  return compiler.watch({ stdin: true }, (err, stats) => {

    if (err) {
      logger('error', err);

      return;
    }

    console.log(stats.toString({
      all: false,
      colors: true,
      builtAt: true,
      timings: true,
      errors: true,
      warnings: true,
    }));

    if (callback)
      callback();
  });
}

/**
 * @param {() => void | undefined} callback
 */
export function build(callback) {
  webpack(config).run(callback);
}
