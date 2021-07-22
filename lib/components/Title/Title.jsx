import PropTypes from 'prop-types'
import React from 'react'
import { H1 } from 'components/Heading'

const getClassName = className => (Array.isArray(className) ? className.join(' ') : className)

function Title (props) {
  return (
    <H1 className={getClassName(props.className)} id={props.id || null}>
      {props.text || null}
      {props.children}
    </H1>
  )
}

Title.propTypes = {
  id: PropTypes.string,
  text: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
}

export default Title
