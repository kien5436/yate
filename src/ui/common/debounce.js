export default function debounce(func, wait = 250, immediate = false) {
  let timeout;
  let previous;
  let args;
  let result;
  let context;

  const later = function() {
    const passed = Date.now() - previous;

    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    }
    else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);

      if (!timeout) args = context = null;
    }
  };

  // eslint-disable-next-line no-underscore-dangle
  const debounced = function(..._args) {
    // eslint-disable-next-line no-invalid-this
    context = this;
    args = _args;
    previous = Date.now();

    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }

    return result;
  };

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}
