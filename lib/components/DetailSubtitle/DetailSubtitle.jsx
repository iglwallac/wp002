import PropTypes from 'prop-types'
import React from 'react'
import { H4 } from 'components/Heading'

function getClassName (inputClassName) {
  return ['detail_subtitle'].concat(inputClassName || []).join(' ')
}

function DetailSubtitle (props) {
  return <H4 className={getClassName(props.className)}>{props.children}</H4>
}

DetailSubtitle.propTypes = {
  className: PropTypes.array,
}

export default DetailSubtitle
