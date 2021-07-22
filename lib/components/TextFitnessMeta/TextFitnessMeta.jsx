import PropTypes from 'prop-types'
import React from 'react'

function TextFitnessMeta (props) {
  const meta = []

  if (props.fitnessStyle) {
    meta.push(
      <span
        className={props.className}
        key={`${props.className}-style-${props.id}`}
      >
        {props.fitnessStyle}
      </span>,
    )
  }
  if (props.fitnessLevel) {
    meta.push(
      <span
        className={props.className}
        key={`${props.className}-level-${props.id}`}
      >
        {props.fitnessLevel}
      </span>,
    )
  }

  return meta.length > 0 ? <span>{meta}</span> : null
}

TextFitnessMeta.propTypes = {
  id: PropTypes.number.isRequired,
  className: PropTypes.string.isRequired,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
}

export default TextFitnessMeta
