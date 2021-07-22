import PropTypes from 'prop-types'
import React from 'react'
import { H4 } from 'components/Heading'

function getClassName (props) {
  return ['tile-row-title']
    .concat(props.className ? props.className : [])
    .join(' ')
}

function TileRowTitle (props) {
  const className = getClassName(props)

  return <H4 className={className}>{props.title}</H4>
}

TileRowTitle.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.array,
}

export default TileRowTitle
