import React, { useState } from 'react'
import PropTypes from 'prop-types'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { Button } from 'components/Button.v2'

const Expandable = ({ variant, header, description, initiallyExpanded, children }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const variantClassName = variant ? `variant-${variant}` : ''
  return (
    <div className={`expandable ${variantClassName}`}>
      <Button
        className={`expandable__header${expanded ? ' expandable__header--expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`expandable__header-label${expanded ? ' expandable__header-label--expanded' : ''}`}>
          {header}
        </span>
        <span className={`expandable__icon${expanded ? ' expandable__icon--expanded' : ''}`}>
          <IconV2
            type={expanded ? ICON_TYPES.CHEVRON_UP : ICON_TYPES.CHEVRON_DOWN}
          />
        </span>
      </Button>
      {
        description &&
        <div className="expandable__header-description">
          {(typeof description === 'function') ? description() : (<div>
            {description}
          </div>)}
        </div>
      }
      {expanded ?
        <div className="expandable__content">
          {children}
        </div>
        : null
      }
    </div>
  )
}

Expandable.propTypes = {
  header: PropTypes.string,
  description: PropTypes.oneOfType([
    PropTypes.string, PropTypes.func,
  ]),
  initiallyExpanded: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default Expandable
