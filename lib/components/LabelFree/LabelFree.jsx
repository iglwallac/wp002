import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _get from 'lodash/get'
import _isBool from 'lodash/isBoolean'
import _toString from 'lodash/toString'
import { isEntitled, featureIsFree } from 'services/subscription'
import {
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
} from 'services/content-type'
import { get as getConfig } from 'config'

const config = getConfig()

export const LABEL_FREE_STANDARD = 'LABEL_FREE_STANDARD'
export const LABEL_FREE_STATIC = 'LABEL_FREE_STATIC'

function getClassName (classes, type, userLanguage) {
  const inputClasses = classes || []
  if (type === LABEL_FREE_STATIC) {
    inputClasses.push('label-free--static')
  }
  if (userLanguage) {
    inputClasses.push(`label-free--${userLanguage}`)
  }
  return ['label-free'].concat(inputClasses).join(' ')
}

function isSeries (contentType) {
  switch (contentType) {
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return true
    default:
      return false
  }
}

function renderLabel (className, type, userLanguage, staticText) {
  return (
    <div className={getClassName(className, type, userLanguage)}>
      {staticText.get('free')}
    </div>
  )
}

function LabelFree (props) {
  const {
    featureOfferingAvailibility,
    userSubscriptions,
    contentType,
    staticText,
    className,
    isFree,
    type,
    user,
  } = props
  const userLanguage = _toString(
    user.getIn(['data', 'language', 0], _get(config, ['appLang'])),
  )
  const userIsEntitled = isEntitled(userSubscriptions)
  const featureOfferingIsFree = featureIsFree(featureOfferingAvailibility)
  const isContentTypeSeries = isSeries(contentType)

  if (_isBool(isFree)) {
    return isFree ? renderLabel(className, type, userLanguage, staticText) : null
  } else if (userIsEntitled || !featureOfferingIsFree || isContentTypeSeries) {
    return null
  }
  return renderLabel(className, type, userLanguage, staticText)
}

LabelFree.props = {
  isFree: PropTypes.bool,
  className: PropTypes.array,
  type: PropTypes.string.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  featureOfferingAvailibility: PropTypes.string.isRequired,
  userSubscriptions: ImmutablePropTypes.list.isRequired,
  contentType: PropTypes.string.isRequired,
}

LabelFree.defaultProps = {
  type: LABEL_FREE_STANDARD,
}

export default connect(state => ({
  user: state.user,
  staticText: state.staticText.getIn(['data', 'labelFree', 'data']),
}))(LabelFree)
