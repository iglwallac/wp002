import { List } from 'immutable'
import _get from 'lodash/get'
import { activatePage } from 'services/optimizely'
import { SET_EVENT_PAGE_VIEWED } from 'services/event-tracking/actions'
import { getAuthIsLoggedIn } from 'services/auth'
import { AUTH_LOGIN, SET_AUTH_DATA, AUTH_CHANGE_PROFILE, SET_AUTH_LOGIN_FAILED } from 'services/auth/actions'
import { setInterstitial, removeInterstitial } from 'services/interstitial/actions'
import { USER_PROFILES_SET } from 'services/user-profiles/actions'
import { SET_RESOLVER_LOCATION } from 'services/resolver/actions'
import { INTERSTITIAL_SELECT_PROFILE } from 'services/interstitial'
import { SET_USER_DATA } from 'services/user/actions'
import { EN } from 'services/languages/constants'
import { getPrimary } from 'services/languages'
import { setNewRelicRoute, addNewRelicAction } from './_newrelic'
import updateGoogleRecaptcha from './_google-recaptcha'
import updateRoute from './_change-route'
import updateZendesk from './_zendesk'
import getViewport from './_viewport'

import {
  SET_APP_BOOTSTRAP_PHASE,
  setAppViewport,
  enableHeader,
  enableFooter,
  enableRoutes,
} from './actions'

import {
  BOOTSTRAP_PHASE_POST_RENDER,
  BOOTSTRAP_PHASE_COMPLETE,
} from '.'

let timer = null

export function watchLoginFailed ({ after }) {
  return after(SET_AUTH_LOGIN_FAILED, ({ dispatch }) => {
    dispatch(removeInterstitial())
  })
}

export function watchAuthChange ({ after }) {
  return after([
    AUTH_CHANGE_PROFILE,
    AUTH_LOGIN,
  ], ({ action, state, dispatch }) => {
    const { checkout } = state
    const { type } = action
    if (type === AUTH_LOGIN
      && checkout.get('orderData')) {
      return
    }
    dispatch(setInterstitial())
  })
}

export function watchUserDataReady ({ after }) {
  return after([
    SET_AUTH_DATA,
    SET_USER_DATA,
    USER_PROFILES_SET,
  ], ({ state, dispatch }) => {
    const { userProfiles, auth, user, app } = state
    if (getAuthIsLoggedIn(auth)
      && userProfiles.get('data', List()).size
      && user.getIn(['data', 'uid']) === auth.get('uid')) {
      const shouldPrompt = userProfiles.get('promptProfileSelector')
      const routesEnabled = app.get('enableRoutes')
      // if the user has not selected a profile yet...
      // this is typically the situation where a users first logs in
      if (shouldPrompt) {
        dispatch(setInterstitial(INTERSTITIAL_SELECT_PROFILE))
        return
      }
      // if the routing system (and content) is not enabled,
      // now it the time to enable them so when the interstitial is removed
      // the user can see the damn page content!
      if (!routesEnabled) {
        dispatch(enableRoutes())
      }
      // remove interstitial
      dispatch(removeInterstitial())
    }
  })
}

export function logNewRelicPageTimes ({ before }) {
  return before(SET_APP_BOOTSTRAP_PHASE, ({ state, action }) => {
    const { payload } = action
    const { phase } = payload
    const { app } = state
    if (phase === BOOTSTRAP_PHASE_POST_RENDER) {
      const now = (new Date()).getTime()
      const time = app.get('initializationStartTime')
      addNewRelicAction('PageInitialization', {
        timeInSeconds: Math.floor(now / 1000) - Math.floor(time / 1000),
        timeInMilliseconds: now - time,
        startDate: time,
        endDate: now,
      })
    }
  })
}

export function watchBootstrapPhase ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, ({ state, dispatch }) => {
    const { app } = state

    switch (app.get('bootstrapPhase')) {
      case BOOTSTRAP_PHASE_POST_RENDER: {
        const header = app.get('enableHeader')
        const footer = app.get('enableFooter')
        if (!header) {
          dispatch(enableHeader())
        }
        if (!footer) {
          dispatch(enableFooter())
        }
        activatePage('web_app__all_pages')
        break
      }
      case BOOTSTRAP_PHASE_COMPLETE: {
        global.addEventListener('resize', () => {
          if (timer) {
            clearTimeout(timer)
          }
          timer = setTimeout(() => {
            dispatch(setAppViewport(getViewport()))
            clearTimeout(timer)
            timer = null
          }, 400)
        }, false)
        break
      }
      default:
        break
    }
  })
}

export function updateOnPageView ({ before }) {
  return before(SET_EVENT_PAGE_VIEWED, ({ action, state }) => {
    const { payload = {} } = action
    const { location = {} } = payload
    const { auth, user, config } = state
    const isLoggedIn = getAuthIsLoggedIn(auth)
    const userLanguage = getPrimary(user.getIn(['data', 'language'], List([EN])))
    updateZendesk(location, userLanguage, isLoggedIn)
    updateGoogleRecaptcha(location, auth, config)
    setNewRelicRoute(location, auth)
    updateRoute(location)
  })
}

export function updateNewRelic ({ after }) {
  return after(SET_AUTH_DATA, ({ state }) => {
    const { resolver, auth } = state
    const location = resolver.get('location')
    setNewRelicRoute(location, auth)
  })
}

export function updateOnResolverLocation ({ before }) {
  return before(SET_RESOLVER_LOCATION, ({ action, state }) => {
    const { payload = {} } = action
    const { location = {} } = payload
    const { resolver = {}, user, auth } = state
    const isLoggedIn = getAuthIsLoggedIn(auth)
    const userLanguage = getPrimary(user.getIn(['data', 'language'], List([EN])))

    // all other updateZendesk calls are handled by updateOnPageView
    const locationFullplayerQuery = _get(location, ['query', 'fullplayer'])
    const resolverFullplayerQuery = resolver.getIn(['query', 'fullplayer'])

    // fire updateZendesk if we are transitioning from a non-fullplayer page
    // to a fullplayer page
    if (locationFullplayerQuery && !resolverFullplayerQuery) {
      updateZendesk(location, userLanguage, isLoggedIn)
    }

    // fire updateZendesk if we are transitioning from a fullplayer page
    // to a non-fullplayer page
    if (!locationFullplayerQuery && resolverFullplayerQuery) {
      updateZendesk(location, userLanguage, isLoggedIn)
    }
  })
}
