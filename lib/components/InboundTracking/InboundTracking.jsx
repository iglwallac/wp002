import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { queryContainsTracking, purgeSessionTracking } from 'services/inbound-tracking'

const updateData = (props) => {
  const {
    auth,
    serverTime,
    location,
    inboundTracking,
    parseInboundTrackingUrl,
    getInboundTrackingPersistent,
    getServerTimeData,
  } = props
  const serverTimestamp = serverTime.getIn(['data', 'serverTime'])
  const path = location.pathname + location.search || ''
  // Don't do any work if we have the results for this path
  if (
    !inboundTracking.get('initialized') &&
    !inboundTracking.get('processing')
  ) {
    return getInboundTrackingPersistent({ auth })
  }
  // If we are not done processing don't do more work
  if (
    !inboundTracking.get('initialized') ||
    !queryContainsTracking(location.query) ||
    inboundTracking.get('path') === path
  ) {
    return undefined
  }
  // We are initialized so we can parse the URL after we get server time
  if (!serverTimestamp && !serverTime.get('processing')) {
    return getServerTimeData(auth)
  } else if (serverTimestamp) {
    const query = location.query
    const options = {
      uid: auth.get('uid'),
      path,
      query,
      timestamp: serverTimestamp,
      auth,
    }
    parseInboundTrackingUrl(options)
  }
  return undefined
}

function onUnload (e, props) {
  const { auth } = props
  purgeSessionTracking({
    uid: auth.get('uid'),
    auth,
  })
}

class InboundTracking extends PureComponent {
  constructor (props) {
    super(props)
    this.handleOnUnload = e => onUnload(e, props)
  }

  componentDidMount () {
    updateData(this.props)
    if (window) {
      window.addEventListener('beforeunload', this.handleOnUnload)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER) {
      updateData(nextProps)
    }
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.handleOnUnload)
  }

  render () {
    return null
  }
}

InboundTracking.propTypes = {
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  serverTime: ImmutablePropTypes.map.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  parseInboundTrackingUrl: PropTypes.func.isRequired,
  getServerTimeData: PropTypes.func.isRequired,
  getInboundTrackingPersistent: PropTypes.func.isRequired,
}

export default connect(
  state => ({
    auth: state.auth,
    serverTime: state.serverTime,
    inboundTracking: state.inboundTracking,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      parseInboundTrackingUrl: actions.inboundTracking.parseInboundTrackingUrl,
      getInboundTrackingPersistent:
        actions.inboundTracking.getInboundTrackingPersistent,
      getServerTimeData: actions.serverTime.getServerTimeData,
    }
  },
)(InboundTracking)
