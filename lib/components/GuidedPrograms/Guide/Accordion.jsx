import React, { useState } from 'react'
import PropTypes from 'prop-types'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { Button } from 'components/Button.v2'

const Accordion = ({ label, initiallyExpanded, children }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  return (
    <div className="expandable">
      <Button
        className={`expandable__header${expanded ? ' expandable__header--expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`expandable__header-label${expanded ? ' expandable__header-label--expanded' : ''}`}>
          {label}
        </span>
        <span className={`expandable__icon${expanded ? ' expandable__icon--expanded' : ''}`}>
          <IconV2 type={expanded ? ICON_TYPES.CHEVRON_UP : ICON_TYPES.CHEVRON_DOWN} />
        </span>
      </Button>
      <div className="expandable__desktop-header">
        {label}
      </div>
      <div className={`expandable__content${!expanded
        ? ' expandable__content--collapsed' : ''}`}
      >
        {children}
      </div>
    </div>
  )
}

Accordion.propTypes = {
  label: PropTypes.any.isRequired,
  initiallyExpanded: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default Accordion
