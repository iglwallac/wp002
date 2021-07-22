import React from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import Arrow from './Arrow'

export const DIRECTION_LEFT = 'left'
export const DIRECTION_RIGHT = 'right'
export const DIRECTION_UP = 'up'
export const DIRECTION_DOWN = 'down'

const ToolTipArrow = (props) => {
  const {
    activeArrow,
    currentArrow,
    direction,
    className,
    path,
  } = props


  if (activeArrow === currentArrow && path === '/') {
    return (
      <div className={className || activeArrow}>
        <Arrow direction={direction} />
      </div>
    )
  }

  return null
}

ToolTipArrow.propTypes = {
  className: PropTypes.string,
  activeArrow: PropTypes.string.isRequired,
  direction: PropTypes.oneOf([DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_DOWN]),
}

export default connectRedux(
  state => ({
    currentArrow: state.tour.get('activeArrow'),
    path: state.resolver.get('path'),
  }),
)(ToolTipArrow)
