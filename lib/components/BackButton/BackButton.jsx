import React from 'react'
import PropTypes from 'prop-types'

import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES } from 'components/Button.v2'

const getClass = (className) => {
  const cls = ['back-button']
  if (className) cls.push(className)
  return cls.join(' ')
}
function BackButton ({ className, onClick, url, children }) {
  return (
    <Button
      className={getClass(className)}
      type={TYPES.GHOST}
      onClick={onClick}
      url={url}
    >
      <Icon type={ICON_TYPES.CHEVRON_LEFT} />
      {children}
    </Button>
  )
}

BackButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  url: PropTypes.string,
}

export default BackButton
