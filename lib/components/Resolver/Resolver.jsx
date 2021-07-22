import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { getBoundActions } from 'actions'
// eslint-disable-next-line no-unused-vars
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import {
  historyRedirect,
  HISTORY_METHOD_REPLACE,
} from 'services/navigation'

function handleRedirects (props) {
  const {
    setResolverRedirectPath,
    onboardingIncomplete,
    isLoggedIn,
    language,
    resolver,
    history,
    auth,
  } = props

  if (!resolver.get('data')) return

  const url = resolver.getIn(['data', 'url'])
  const redirectType = resolver.getIn(['data', 'redirectType'])
  const redirectPath = resolver.get('redirectPath')

  if (redirectType && url) {
    window.location.href = url
  } else if (!resolver.get('processing') && redirectPath) {
    setResolverRedirectPath(null)
    historyRedirect({
      historyMethod: HISTORY_METHOD_REPLACE,
      url: redirectPath,
      language,
      history,
      auth,
    })
  } else if (
    isLoggedIn &&
    onboardingIncomplete &&
    window.location.pathname !== '/get-started' &&
    window.location.pathname !== '/cart/confirmation' &&
    window.location.pathname !== '/account/profile' // remove this line after Optimizely experiment 19422180075 is done
  ) {
    historyRedirect({
      url: '/get-started',
      language,
      history,
      auth,
    })
  }
}

class Resolver extends PureComponent {
  componentDidMount () {
    if (!process.env.BROWSER) return
    handleRedirects(this.props)
  }
  componentDidUpdate (prevProps) {
    if (prevProps === this.props) return
    if (!process.env.BROWSER) return
    handleRedirects(this.props)
  }

  render () {
    return null
  }
}

Resolver.propTypes = {
  setResolverRedirectPath: PropTypes.func.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
}

Resolver.contextTypes = {
  history: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        resolver: state.resolver,
        onboarding: state.onboarding,
        isLoggedIn: state.auth.get('jwt'),
        language: state.user.getIn(['data', 'language']),
        onboardingIncomplete: state.onboarding.get('completed') === false
          && state.onboarding.get('processing') !== true,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return { setResolverRedirectPath: actions.resolver.setResolverRedirectPath }
    },
  ),
)(Resolver)
