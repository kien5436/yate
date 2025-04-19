/**
 * @param {'error' | 'info'} level
 * @param {...any} args
 */
export default function(level, ...args) {

  if ('error' === level)
    console.error('\x1b[1m\x1b[31m%s \x1b[0m', ...args);
  else
    console.log('\x1b[1m\x1b[34m%s\x1b[0m', ...args);
}
