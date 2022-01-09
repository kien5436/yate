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
    default: 'yate-text-base',
    lg: 'yate-text-lg',
    sm: 'yate-text-sm',
    xl: 'yate-text-xl',
    xs: 'yate-text-xs',
  };
  const iconClass = classname({
    [iconSize[size]]: true,
    [name]: true,
    'yate-inline-block feather': true,
  });

  return (
    <span {...props}
      className={`yate-inline-flex yate-justify-center yate-items-center yate-w-6 yate-h-6 ${className}`}>
      <i className={iconClass} />
    </span>
  );
}