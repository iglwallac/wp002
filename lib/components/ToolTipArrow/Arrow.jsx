import React from 'react'
import PropTypes from 'prop-types'

const DIRECTIONS = ['up', 'down', 'left', 'right']

const Arrow = (props) => {
  const { direction } = props

  return (
    <div className="arrow">
      <div className={`arrow__${direction}`} />
    </div>
  )
}

Arrow.propTypes = {
  direction: PropTypes.oneOf(DIRECTIONS),
}

export default Arrow
