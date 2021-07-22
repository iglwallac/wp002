import React from 'react'
import PropTypes from 'prop-types'
import Icon from 'components/Icon'
import Link, { TextLink, URL_JAVASCRIPT_VOID } from 'components/Link'
import { MENU_ITEM_ICON_TYPE_ARROW } from './types'

function renderIcon (iconType, iconClassName) {
  switch (iconType) {
    case MENU_ITEM_ICON_TYPE_ARROW:
      return <Icon iconClass={['icon--down'].concat(iconClassName || [])} />
    default: return null
  }
}

const MenuItem = React.memo((props) => {
  const {
    url,
    index,
    label,
    target,
    onClick,
    itemClass,
    linkClass,
    iconType,
    children,
    scrollToTop,
    iconClassName,
  } = props

  const liClasses = itemClass ? `menu-item ${itemClass}` : 'menu-item'
  const linkClasses = linkClass ? `menu-item__link ${linkClass}` : 'menu-item__link'
  const icon = renderIcon(iconType, iconClassName)
  return (
    <li className={liClasses}>
      {
        icon ? (
          <Link
            to={url || URL_JAVASCRIPT_VOID}
            scrollToTop={scrollToTop}
            className={linkClasses}
            data-index={index}
            onClick={onClick}
            target={target}
          >
            {label}
            {icon}
          </Link>
        ) : (
          <TextLink
            to={url || URL_JAVASCRIPT_VOID}
            scrollToTop={scrollToTop}
            className={linkClasses}
            data-index={index}
            onClick={onClick}
            target={target}
            text={label}
          />
        )
      }
      {children}
    </li>
  )
})

MenuItem.propTypes = {
  itemClass: PropTypes.string.isRequired,
  linkClass: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  iconClassName: PropTypes.string,
  iconType: PropTypes.string,
  scrollToTop: PropTypes.bool,
  target: PropTypes.string,
  onClick: PropTypes.func,
  url: PropTypes.string,
}

export default MenuItem
