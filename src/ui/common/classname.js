/**
 * render class name bases on conditions
 * @param {object} classes
 * @returns
 */
export default function classname(classes) {
  return Object.keys(classes).filter(key => !!classes[key]).join(' ');
}