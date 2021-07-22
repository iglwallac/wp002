import React from 'react'
import PropTypes from 'prop-types'
import isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'
import { READY_STATE } from '../DaytonaReadyState'

function getReadyState (props, state) {
  const { ready } = state
  const { initialized, failure } = props
  if (!process.env.BROWSER || !ready || initialized !== true) {
    return READY_STATE.BEFORE_READY
  }
  if (failure === true) {
    return READY_STATE.FAILURE
  }
  return READY_STATE.READY
}

class DaytonaDefault extends React.Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      ready: false,
    }
  }

  componentDidMount () {
    // we need to do this to prevent server side rendering conflicts
    // when the initial client side rendering reconsilliation is hit, so the markup
    // is in sync and doesnt cause weird React issues.
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(() => ({
      ready: true,
    }))
  }

  render () {
    const { props, state } = this
    const { children = null, unwrap } = props
    const component = isFunction(children)
      ? children(getReadyState(props, state)) : children
    return unwrap ? component : (
      <section className="daytona-campaign default">
        {component}
      </section>
    )
  }
}

DaytonaDefault.propTypes = {
  unwrap: PropTypes.bool,
}

export default connectRedux((state) => {
  const { testarossa } = state
  return {
    initialized: testarossa.get('initialized'),
    failure: testarossa.get('failure'),
  }
})(DaytonaDefault)
