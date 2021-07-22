import React from 'react'
import PropTypes from 'prop-types'
// import get from 'lodash/get'
// import some from 'lodash/some'
import isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'
import { READY_STATE } from '../TestarossaReadyState'

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

class TestarossaDefault extends React.Component {
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

  // shouldComponentUpdate (nextProps) {
  //   const { props } = this
  //   const { noCache } = props
  //   return some(nextProps, (nextProp, key) => {
  //     if (key === 'children' && !noCache) return false
  //     return nextProp !== get(props, key)
  //   })
  // }

  render () {
    const { props, state } = this
    const { children = null, unwrap } = props
    const component = isFunction(children)
      ? children(getReadyState(props, state)) : children
    return unwrap ? component : (
      <section className="testarossa-campaign default">
        {component}
      </section>
    )
  }
}

TestarossaDefault.propTypes = {
  unwrap: PropTypes.bool,
  noCache: PropTypes.bool,
}

export default connectRedux((state) => {
  const { testarossa } = state
  return {
    initialized: testarossa.get('initialized'),
    failure: testarossa.get('failure'),
  }
})(TestarossaDefault)
