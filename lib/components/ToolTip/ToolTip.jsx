import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'

function getClassName (inputClassName) {
  return ['tool-tip'].concat(inputClassName || []).join(' ')
}

function getContinerClassName (inputClassName) {
  return ['tool-tip__inner']
    .concat(inputClassName || [])
    .join(' ')
}

function getArrowClassName (inputClassName) {
  return ['tool-tip__arrow']
    .concat(inputClassName || [])
    .join(' ')
}

function ToolTip (props) {
  const {
    sherpa,
    visible,
    children,
    className,
    arrowClassName,
    containerClassName,
    featureName,
    incrementFeatureImpressionCount,
  } = props

  useEffect(() => {
    if (featureName) {
      incrementFeatureImpressionCount(featureName)
    }
  }, [])

  if (!visible) {
    return null
  }
  return (
    <div className={getClassName(className)}>
      <span className={getArrowClassName(arrowClassName)} />
      <div className={getContinerClassName(containerClassName)}>
        {sherpa ? <div className="tool-tip__sherpa" /> : null}
        {children}
      </div>
    </div>
  )
}

ToolTip.propTypes = {
  visible: PropTypes.bool,
  className: PropTypes.array,
  containerClassName: PropTypes.array,
  arrowClassName: PropTypes.array,
  sherpa: PropTypes.bool,
  featureName: PropTypes.string,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        featureTracking: state.featureTracking,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        incrementFeatureImpressionCount: actions.featureTracking.incrementFeatureImpressionCount,
      }
    },
  ),
)(ToolTip)
