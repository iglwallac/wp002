import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import _partial from 'lodash/partial'
import ScrollTo from 'components/ScrollTo'
import { getFeatureTrackingKey } from 'services/tool-tip'

export const TYPE_FEATURE_TRACKING = 'TYPE_FEATURE_TRACKING' // Load persistent data from feature tracking.
export const TYPE_LOCAL_STORAGE = 'TYPE_LOCAL_STORAGE' // Load persistent data from local storage.

function renderScrollTo (props) {
  const { toolTipVisible, enableScroll } = props
  if (!toolTipVisible || !enableScroll) {
    return null
  }
  return (
    <ScrollTo
      duration={500}
      offset={-170}
      runOnMount
      easing="easeOutQuart"
    />
  )
}

class ToolTipTrigger extends Component {
  componentDidMount () {
    const { enableScroll } = this.props
    if (enableScroll) {
      this.setScrollListener()
    }
  }

  componentWillUnmount () {
    this.destroyScrollListener()
  }

  setScrollListener = () => {
    window.addEventListener('scroll', this.handleWindowScroll)
  }

  destroyScrollListener = () => {
    window.removeEventListener('scroll', this.handleWindowScroll)
  }

  handleWindowScroll = () => {
    const {
      auth,
      storeKey,
      setFeatureTrackingDataPersistent,
      setToolTipVisible,
    } = this.props
    const doc = document.documentElement
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    if (top < 140) {
      return
    }
    const featureTrackingKey = getFeatureTrackingKey(storeKey)
    if (featureTrackingKey) {
      const date = new Date()
      const data = Map({ [featureTrackingKey]: date.toUTCString() })
      setFeatureTrackingDataPersistent({ auth, data })
    }
    setTimeout(_partial(setToolTipVisible, storeKey, true), 10)
    this.destroyScrollListener()
  }

  render () {
    const { props } = this
    const { children } = props
    return (
      <div className="tool-tip-trigger">
        {children}
        {renderScrollTo(props)}
      </div>
    )
  }
}

ToolTipTrigger.propTypes = {
  storeKey: PropTypes.string.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  toolTip: ImmutablePropTypes.map.isRequired,
  enableScroll: PropTypes.bool,
  setToolTipVisible: PropTypes.func.isRequired,
  toggleToolTipVisible: PropTypes.func.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}

ToolTipTrigger.contextTypes = {
  store: PropTypes.object.isRequired,
}

const connectedToolTipTrigger = connectRedux(
  state => ({
    auth: state.auth,
    toolTip: state.toolTip,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setToolTipVisible: actions.toolTip.setToolTipVisible,
      toggleToolTipVisible: actions.toolTip.toggleToolTipVisible,
      setFeatureTrackingDataPersistent:
        actions.featureTracking.setFeatureTrackingDataPersistent,
    }
  },
)(ToolTipTrigger)

export default connectedToolTipTrigger
