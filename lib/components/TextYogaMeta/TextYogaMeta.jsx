import PropTypes from 'prop-types'
import React from 'react'

function TextYogaMeta (props) {
  const meta = []

  if (props.yogaStyle) {
    meta.push(
      <span
        className={props.className}
        key={`${props.className}-style-${props.id}`}
      >
        {props.yogaStyle}
      </span>,
    )
  }
  if (props.yogaLevel) {
    meta.push(
      <span
        className={props.className}
        key={`${props.className}-level-${props.id}`}
      >
        {props.yogaLevel}
      </span>,
    )
  }

  return meta.length > 0 ? <span>{meta}</span> : null
}

TextYogaMeta.propTypes = {
  id: PropTypes.number.isRequired,
  className: PropTypes.string.isRequired,
  yogaStyle: PropTypes.string,
  yogaLevel: PropTypes.string,
}

export default TextYogaMeta
