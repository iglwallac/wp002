import React from 'react'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import ToolTipArrow, { DIRECTION_UP } from 'components/ToolTipArrow'

const HAMBURGER_POSITION_TOP = 'top'
const HAMBURGER_POSITION_MIDDLE = 'middle'
const HAMBURGER_POSITION_BOTTOM = 'bottom'

function getClassName (className, isOpen) {
  const cls = ['hamburger']
  if (className) cls.push(className)
  if (isOpen) cls.push('hamburger--open')
  return cls.join(' ')
}

function Hamburger (props) {
  const {
    navigationOverlayVisible,
    className,
    onClick,
  } = props
  return (
    <React.Fragment>
      <Link
        to=""
        title="Menu"
        role="button"
        onClick={onClick}
        aria-haspopup="true"
        aria-controls="nav__mobile"
        className={getClassName(className, navigationOverlayVisible)}
      >
        <span role="presentation" className={`hamburger__${HAMBURGER_POSITION_TOP}`} />
        <span role="presentation" className={`hamburger__${HAMBURGER_POSITION_MIDDLE}`} />
        <span role="presentation" className={`hamburger__${HAMBURGER_POSITION_BOTTOM}`} />
      </Link>
      <ToolTipArrow
        direction={DIRECTION_UP}
        activeArrow="hamburger-menu-arrow"
      />
    </React.Fragment>
  )
}

Hamburger.props = {
  className: PropTypes.string,
  navigationOverlayVisible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default React.memo(Hamburger)
