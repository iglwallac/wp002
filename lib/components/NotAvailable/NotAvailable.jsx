import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'

export const TYPE_NOT_AVAILABLE_STANDARD = 'standard'
export const TYPE_NOT_AVAILABLE_OVERLAY = 'overlay'

function getClassName (type) {
  const classes = ['not-available']
  if (type === TYPE_NOT_AVAILABLE_STANDARD) {
    classes.push('not-available--standard')
  }
  if (type === TYPE_NOT_AVAILABLE_OVERLAY) {
    classes.push('not-available--overlay')
  }
  return classes.join(' ')
}

function NotAvailable (props) {
  const { type, message, staticText } = props
  return (
    <div className={getClassName(type)}>
      <div className="not-available__icon" />
      {type === TYPE_NOT_AVAILABLE_STANDARD ? (
        <div className="not-available__title">
          {staticText.getIn(['data', 'notAvailable'])}
        </div>
      ) : null}
      {message}
    </div>
  )
}

NotAvailable.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connectStaticText({ storeKey: 'notAvailable' })(NotAvailable)
