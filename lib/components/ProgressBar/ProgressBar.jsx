import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { isArray as _isArray } from 'lodash'

export const PROGRESS_BAR_TYPE_GRADIENT = 'gradient'

function getStyle (percent) {
  return { width: `${percent}%` }
}

function getDurationPercent (featurePosition, duration) {
  let percent = 0
  if (featurePosition && duration) {
    percent = (featurePosition / duration) * 100
  }
  if (percent > 100) {
    percent = 100
  }
  return percent
}

function getClassName (classes) {
  return ['progress-bar'].concat(_isArray(classes) ? classes : []).join(' ')
}

function getProgressBarStyleClassName (type) {
  const itemClass = ['progress-bar__progress']
  if (type === PROGRESS_BAR_TYPE_GRADIENT) {
    itemClass.push(`${itemClass}--gradient`)
  }
  return itemClass.join(' ')
}

function ProgressBar (props) {
  const { userInfo, duration, className, type } = props
  const percent = getDurationPercent(userInfo.get('featurePosition'), duration)
  return (
    <div className={getClassName(className)}>
      <div className={getProgressBarStyleClassName(type)} style={getStyle(percent)} />
    </div>
  )
}

ProgressBar.propTypes = {
  userInfo: ImmutablePropTypes.map.isRequired,
  duration: PropTypes.number.isRequired,
  className: PropTypes.array,
  type: PropTypes.string,
}

export default ProgressBar
