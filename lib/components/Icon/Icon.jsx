import React from 'react'
import PropTypes from 'prop-types'
import Link from 'components/Link'

function getClassName (inputClassName, onClick, setHovered) {
  const className = ['icon'].concat(inputClassName || [])
  if (onClick) {
    className.push('icon--action')
  }
  if (setHovered) {
    className.push('tool-tip__tile-hover-container ')
  }
  return className.join(' ')
}

function Icon (props) {
  const { onClick, setHovered } = props
  if (onClick) {
    return (
      <Link
        to=""
        role="button"
        onClick={onClick}
        data-element={props.element || null}
        className={getClassName(props.iconClass, true, setHovered)}
      />
    )
  }
  return (
    <span
      onMouseEnter={() => { if (typeof setHovered === 'function') { setHovered(true) } }}
      onMouseLeave={() => { if (typeof setHovered === 'function') { setHovered(false) } }}
      data-element={props.element || null}
      className={getClassName(props.iconClass, false, setHovered)}
    />
  )
  /* eslint-disable */
  // return (
  //   <span
  //     role="button"
  //     onClick={onClick}
  //     data-element={props.element || null}
  //     className={getClassName(props.iconClass, true)}
  //   />
  // )
}

Icon.propTypes = {
  iconClass: PropTypes.array,
  onClick: PropTypes.func,
}

export default React.memo(Icon)
