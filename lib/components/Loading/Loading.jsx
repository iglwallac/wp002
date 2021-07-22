import PropTypes from 'prop-types'
import React from 'react'

export const LOADING_ICON_WHITE_BG_BLACK = 'white-black'
export const LOADING_ICON_BLUE_DARK_BG_WHITE = 'blue-dark-white'

function getClassName (props) {
  const className = ['loading']
  if (props.visible) {
    className.push('loading--visible')
  }
  return className.join(' ')
}

function getIconClassName (icon) {
  const prefix = 'loading__icon'
  const className = [prefix]
  className.push(`${prefix}--${icon}`)

  return className.join(' ')
}

function Loading (props) {
  return (
    <div className={getClassName(props)}>
      <div className={getIconClassName(props.icon)} />
    </div>
  )
}

Loading.propTypes = {
  visible: PropTypes.bool.isRequired,
  icon: PropTypes.string.isRequired,
}

export default Loading
