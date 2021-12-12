import { h } from 'preact';

import classname from '../common/classname';

/**
 * @param {{
 *  name: string,
 *  className: string,
 *  size: 'default' | 'lg' | 'sm' | 'xl' | 'xs',
 * }} props
 */
export default function Icon({ name, className = '', size = 'default', ...props }) {

  const iconSize = {
    default: 'text-base',
    lg: 'text-lg',
    sm: 'text-sm',
    xl: 'text-xl',
    xs: 'text-xs',
  };
  const iconClass = classname({
    'inline-block feather': true,
    [iconSize[size]]: true,
    [name]: true,
  });

  return (
    <span {...props} className={`inline-flex justify-center items-center w-6 h-6 ${className}`}>
      <i className={iconClass} />
    </span>
  );
}