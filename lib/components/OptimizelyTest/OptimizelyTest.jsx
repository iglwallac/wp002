import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _get from 'lodash/get'
import { connect } from 'react-redux'
import { Map } from 'immutable'

function getClassName (variantId, original) {
  return [
    'optimizely-test',
    `optimizely-test--${variantId}`,
    `optimizely-test--${original ? 'original' : 'variant'}`,
  ].join(' ')
}

function isActive (experiment, variantId, isOriginal) {
  const id = experiment.get('variationId', null)

  if (id !== null) {
    return id === variantId
  }
  return isOriginal
}

function OptimizelyTest (props) {
  const { experiment = Map(), variantId, children, original, disabled } = props

  // If the test is disabled via a query param, just return the original
  if (disabled && original) {
    return <div className="optimizely-test--disabled">{children}</div>
  } else if (disabled && !original) {
    return null
  }

  if (isActive(experiment, variantId, original)) {
    return <div className={getClassName(variantId, original)}>{children}</div>
  }
  return null
}

OptimizelyTest.propTypes = {
  original: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  variantId: PropTypes.string.isRequired,
  experimentId: PropTypes.string.isRequired,
  experiment: ImmutablePropTypes.map.isRequired,
}

function connectState (state, props) {
  const experimentId = _get(props, 'experimentId', '')
  const optimizelyState = _get(state, 'optimizely', Map())
  const experiments = optimizelyState.get('experiments', Map())
  const disabled = optimizelyState.get('disabled')
  return {
    experiment: experiments.get(experimentId, Map()),
    disabled,
  }
}

export default connect(connectState)(OptimizelyTest)
