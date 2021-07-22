import PropTypes from 'prop-types'
import React from 'react'

export const TYPE_LARGE = 'large'
export const TYPE_SMALL = 'small'
export const TYPE_STATIC_WHITE = 'static-white'
export const TYPE_SMALL_BLUE = 'small-blue'
export const TYPE_SMALL_WHITE = 'small-white'
export const TYPE_STATIC_GRAY_DARK = 'static-gray-dark'

function getClassName (props) {
  const { className: inputClassName } = props
  return ['sherpa'].concat(inputClassName || []).join(' ')
}

function getClassNameImage (props) {
  const { type } = props
  const className = ['sherpa__image']
  switch (type) {
    case TYPE_LARGE:
      className.push('sherpa__image--large')
      break
    case TYPE_STATIC_GRAY_DARK:
      className.push('sherpa__image--static-gray-dark')
      break
    case TYPE_STATIC_WHITE:
      className.push('sherpa__image--static-white')
      break
    case TYPE_SMALL_WHITE:
      className.push('sherpa__image--white-small')
      break
    case TYPE_SMALL_BLUE:
      className.push('sherpa__image--blue-small')
      break
    case TYPE_SMALL:
    default:
      className.push('sherpa__image--small')
      break
  }
  return className.join(' ')
}

function Sherpa (props) {
  return (
    <div className={getClassName(props)}>
      <div className={getClassNameImage(props)} />
    </div>
  )
}

Sherpa.propTypes = {
  className: PropTypes.array,
  type: PropTypes.string,
}

export default React.memo(Sherpa)
