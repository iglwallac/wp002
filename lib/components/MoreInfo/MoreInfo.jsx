import PropTypes from 'prop-types'
import React from 'react'
import Icon from 'components/Icon'

function getClassName (props) {
  const { showToolTip, vertical = false } = props
  const className = ['more-info']
  if (showToolTip) {
    className.push('more-info--show-tooltip')
  }
  if (vertical) {
    className.push('more-info--vertical')
  }
  return className.join(' ')
}

function MoreInfo (props) {
  const { active, onClick } = props
  return (
    <button
      aria-label="more information"
      type="button"
      className={getClassName(props)}
      onClick={onClick}
    >
      <Icon
        iconClass={[
          active ? 'icon--dots' : 'icon--dots',
          'more-info__shelf-trigger',
        ]}
      />
    </button>
  )
}

MoreInfo.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  showToolTip: PropTypes.bool,
}

export default React.memo(MoreInfo)

