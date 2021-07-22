import _get from 'lodash/get'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import {
  setLocalPreferences,
  LOCAL_PREFERENCE_COOKIE_OPTIN_ACCEPTED,
} from 'services/local-preferences'
import { Map } from 'immutable'
import { canSetCookie } from 'services/cookie'
import { set as setInboundTrackingPersistent } from 'services/inbound-tracking'
import { get as getConfig } from 'config'
import * as actions from './actions'

const config = getConfig()
const dataPrivacyCompliance = _get(config, ['features', 'anonymousUser', 'dataPrivacyCompliance'])

// -----------------------------------
// Watcher for checking data server side
// -----------------------------------
export function onCookieHydrationComplete ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state }) => {
    const { app, auth } = state
    const authToken = auth.get('jwt')
    const uid = auth.get('uid')

    if (app.get('bootstrapComplete')) {
      if (!canSetCookie(uid, authToken) && dataPrivacyCompliance) {
        dispatch({
          type: actions.SET_COOKIE_CAN_SET_COOKIE,
          payload: false,
        })
      } else {
        dispatch({
          type: actions.SET_COOKIE_CAN_SET_COOKIE,
          payload: true,
        })
      }
    }
  })
}

// -----------------------------------
// Watcher for checking when setCookieBannerAccepted is fired
// -----------------------------------
export function onCookieSetCookieBannerAccepted ({ after }) {
  return after(actions.SET_COOKIE_BANNER_ACCEPTED, async ({ dispatch, state }) => {
    if (dataPrivacyCompliance) {
      const { auth, inboundTracking, emailSignup, user } = state
      const uid = auth.get('uid')
      const inboundTrackingData = inboundTracking.get('data', Map())
      const previewCount = emailSignup.get('previewCount')
      const emailSignupCompleted = emailSignup.get('completed')
      const userData = user.get('data', Map())

      dispatch({
        type: actions.SET_COOKIE_CAN_SET_COOKIE,
        payload: true,
      })

      setLocalPreferences(uid, LOCAL_PREFERENCE_COOKIE_OPTIN_ACCEPTED, true, auth, true)
      // save inboundTracking to ensure it will persist if the cookie banner is accepted
      setInboundTrackingPersistent({ uid, data: inboundTrackingData, auth })

      if (emailSignupCompleted) {
        setLocalPreferences(-1, 'emailSignupCompleted', true, auth)
      }

      if (previewCount) {
        setLocalPreferences(-1, 'emailSignupPreviewCount', previewCount, auth)
      }

      if (userData) {
        setLocalPreferences(-1, 'user', Map({ data: userData }), auth)
      }
    }
  })
}

// -----------------------------------
// Watcher for checking when a user logs in
// -----------------------------------
export function onCookieSetAuthLoginSuccess ({ after }) {
  return after(SET_AUTH_LOGIN_SUCCESS, async ({ dispatch, state }) => {
    if (dataPrivacyCompliance) {
      const { auth, inboundTracking } = state
      const uid = auth.get('uid')
      const loginSuccess = auth.get('loginSuccess')
      const inboundTrackingData = inboundTracking.get('data', Map())

      if (loginSuccess) {
        dispatch({
          type: actions.SET_COOKIE_CAN_SET_COOKIE,
          payload: true,
        })

        // save inboundTracking to ensure it will persist if user logs in off a url
        // that contains UTM data
        setInboundTrackingPersistent({ uid, data: inboundTrackingData, auth })
      }
    }
  })
}
