import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { connect as connectRouter } from 'components/Router/connect'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _partial from 'lodash/partial'
import _omit from 'lodash/omit'
import {
  isFullPlayer,
  isGetStarted,
  isPasswordReset,
  isLogin,
  isLogout,
  isPlans,
  isCart,
  isGo,
} from 'services/url'

const COMPONENT_NAME =
  process.env.NODE_ENV === 'production' ? 'abc' : 'AlertBarConnect'

export default connect

export function connect () {
  return _partial(wrapComponent)
}

export function headerAlertBarShouldRender (location) {
  const { pathname, query } = location
  if (
    isFullPlayer(query) ||
    isGetStarted(pathname) ||
    isPasswordReset(pathname) ||
    isGo(pathname) ||
    isLogin(pathname) ||
    isLogout(pathname) ||
    isPlans(pathname) ||
    isCart(pathname)
  ) {
    return false
  }
  return true
}

function wrapComponent (WrappedComponent) {
  class AlertBarConnect extends PureComponent {
    componentWillReceiveProps (nextProps) {
      if (!process.env.BROWSER) return
      const { location, alertBar, setAlertBarVisible } = nextProps
      const topAlertBarVisible = alertBar.get('visible')
      if (topAlertBarVisible && !headerAlertBarShouldRender(location)) {
        setAlertBarVisible(false)
      }
    }

    render () {
      if (WrappedComponent) {
        return (
          <WrappedComponent
            {..._omit(this.props, [
              'setAlertBarVisible',
              'alertBar',
            ])}
          />
        )
      }
      return null
    }
  }

  AlertBarConnect.displayName = `${COMPONENT_NAME}(${getDisplayName(
    WrappedComponent,
  )})`

  AlertBarConnect.propTypes = {
    location: PropTypes.object.isRequired,
    alertBar: ImmutablePropTypes.map.isRequired,
    setAlertBarVisible: PropTypes.func.isRequired,
  }

  return compose(
    connectRouter(),
    connectRedux(
      state => ({ alertBar: state.alertBar }),
      (dispatch) => {
        const actions = getBoundActions(dispatch)
        return { setAlertBarVisible: actions.alertBar.setAlertBarVisible }
      },
    ),
  )(AlertBarConnect)
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
