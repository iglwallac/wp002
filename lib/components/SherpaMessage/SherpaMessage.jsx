import PropTypes from 'prop-types'
import React from 'react'
import _join from 'lodash/join'
import _concat from 'lodash/concat'

function getClassName (props) {
  const { center } = props
  const className = 'sherpa-message'
  const modifiers = center ? [`${className}--center`] : []
  return _join(_concat([className], modifiers), ' ')
}

function getMessageClassName (props) {
  const { center } = props
  const className = 'sherpa-message__message'
  const modifiers = center ? [`${className}--center`] : []
  return _join(_concat([className], modifiers), ' ')
}

function getArrowClassName (props) {
  const { language } = props
  const prefix = 'sherpa-message__arrow'
  const className = [prefix]

  if (language) {
    className.push(`${prefix}--${language}`)
  }

  return className.join(' ')
}

function SherpaMessage (props) {
  const {
    message,
    children,
    arrow = true,
  } = props
  return (
    <div className={getClassName(props)}>
      <div className="sherpa-message__image" />
      <div className={getMessageClassName(props)}>
        {message}
        {children}
      </div>
      {arrow ? <div className={getArrowClassName(props)} /> : undefined}
    </div>
  )
}

SherpaMessage.propTypes = {
  message: PropTypes.string,
  language: PropTypes.string,
  arrow: PropTypes.bool,
  center: PropTypes.bool,
}

export default SherpaMessage
