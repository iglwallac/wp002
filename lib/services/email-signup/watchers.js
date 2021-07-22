import _get from 'lodash/get'
import { addToasty } from 'services/toasty/actions'
import { FORM_NAME_PREVIEW_GATE } from 'services/form'
import { setLocalPreferences, getLocalPreferences } from 'services/local-preferences'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_EVENT_VIDEO_VIEW_QUALIFIED } from 'services/event-tracking/actions'
import { SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import { URL_ACCOUNT_CHANGE_PLAN } from 'services/url/constants'
import { get as getConfig } from 'config'
import * as ACTIONS from './actions'

const config = getConfig()
const gatedPreviews = _get(config, ['features', 'player', 'gatedPreviews'])

// -----------------------------------
// Watcher for toasty when report is made
// -----------------------------------
export function emailCaptureCreateToasty ({ after }) {
  return after([
    ACTIONS.SET_EMAIL_SIGNUP_SUCCESS,
  ], async ({ dispatch, state, action }) => {
    const { staticText } = state
    const { payload } = action
    const { success, processing, formName } = payload

    const successMsg = staticText.getIn(['data', 'emailCapture', 'data', 'successMessage'])
    const errorMsg = staticText.getIn(['data', 'emailCapture', 'data', 'errorMessageRegistrationError'])
    const shouldShowToasty = formName !== FORM_NAME_PREVIEW_GATE
    const msg = success ? successMsg : errorMsg

    if (!processing && shouldShowToasty) dispatch(addToasty(msg))
  }).when(({ state }) => {
    const { resolver } = state
    const path = resolver.getIn(['data', 'path'])

    return (
      path !== URL_ACCOUNT_CHANGE_PLAN
    )
  })
}

// -----------------------------------
// Watcher for successful email signup
// -----------------------------------
export function emailSignupSuccess ({ after }) {
  return after([
    ACTIONS.SET_EMAIL_SIGNUP_SUCCESS,
  ], async ({ dispatch, state, action }) => {
    const { auth } = state
    const { payload } = action
    const { success, processing } = payload
    const authToken = auth.get('jwt')

    if (gatedPreviews && !authToken && !processing && success) {
      // set data for anonymous user only
      setLocalPreferences(-1, 'emailSignupCompleted', true, auth)
      dispatch(ACTIONS.setEmailSignupConfirmation(true))

      // wait 3 seconds and then remove preview gate
      setTimeout(() => {
        dispatch(ACTIONS.setEmailSignupPreviewGateVisible(false))
      }, 3000)
    }
  })
}

// -----------------------------------
// Watcher for app bootstrap complete
// -----------------------------------
export function emailSignupBootstrapComplete ({ after }) {
  return after([
    SET_APP_BOOTSTRAP_PHASE,
  ], async ({ dispatch, state, action }) => {
    const { auth } = state
    const { payload } = action
    const { isComplete } = payload
    const authToken = auth.get('jwt')

    if (gatedPreviews && !authToken && isComplete) {
      // get data for anonymous user only
      const signupCompleted = getLocalPreferences(-1, 'emailSignupCompleted') || false
      const previewCount = getLocalPreferences(-1, 'emailSignupPreviewCount') || 0

      dispatch(ACTIONS.setEmailSignupConfirmation(signupCompleted))
      dispatch(ACTIONS.setEmailSignupVideoPreviewCount(previewCount))
    }
  })
}

// -----------------------------------
// Watcher for a qualified video view
// -----------------------------------
export function emailSignupVideoViewQualified ({ after }) {
  return after([
    SET_EVENT_VIDEO_VIEW_QUALIFIED,
  ], async ({ dispatch, state }) => {
    const { auth, emailSignup } = state
    const authToken = auth.get('jwt')

    if (authToken) {
      return
    }

    if (gatedPreviews) {
      const previewCount = getLocalPreferences(-1, 'emailSignupPreviewCount') || emailSignup.get('previewCount') || 0
      const nextPreviewCount = previewCount + 1

      // set data for anonymous user only
      setLocalPreferences(-1, 'emailSignupPreviewCount', nextPreviewCount, auth)
      dispatch(ACTIONS.setEmailSignupVideoPreviewCount(nextPreviewCount))
    }
  })
}

// -----------------------------------
// Watcher for a successful login
// -----------------------------------
export function emailSignupAuthLoginSuccess ({ after }) {
  return after([
    SET_AUTH_LOGIN_SUCCESS,
  ], async ({ dispatch, state }) => {
    const { auth, emailSignup } = state
    const authToken = auth.get('jwt')
    const loginSuccess = auth.get('loginSuccess')
    const previewGateVisible = emailSignup.get('previewGateVisible')

    if (!authToken) {
      return
    }

    if (gatedPreviews && loginSuccess && previewGateVisible) {
      dispatch(ACTIONS.setEmailSignupPreviewGateVisible(false))
    }
  })
}
