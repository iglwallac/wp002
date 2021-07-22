import set from 'lodash/set'
import get from 'lodash/get'
import isNil from 'lodash/isNil'
import assign from 'lodash/assign'
import toLower from 'lodash/toLower'
import { List, Map } from 'immutable'
import { SET_AUTH_DATA, SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import { BOOTSTRAP_PHASE_INIT } from 'services/app'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_CHECKOUT_ORDER_DATA } from 'services/checkout/actions'
import { SET_RESOLVER_LOCATION } from 'services/resolver/actions'
import { SET_ONBOARDING_COMPLETED } from 'services/onboarding/actions'
import { SET_INBOUND_TRACKING_DATA_INITIALIZED } from 'services/inbound-tracking/actions'
import { SET_USER_DATA_LANGUAGE_PRIMARY, SET_USER_DATA_LANGUAGE } from 'services/user/actions'
import { SET_COOKIE_BANNER_ACCEPTED } from 'services/cookie/actions'
import { get as getConfig } from 'config'
import { canSetCookie } from 'services/cookie'
import { setRecords, setInitialized, setInitialState, setContext as setReduxContext } from './actions'
import { isDisabled, setContext, hasInitialized } from './'

const stamp = new Date()
const config = getConfig()
const serverTestarossa = get(config, ['servers', 'testarossa'])
const dataPrivacyCompliance = get(config, ['features', 'anonymousUser', 'dataPrivacyCompliance'])

function v12Configure (state, dispatch) {
  // if testarossa has already initialized, is disabled, or failed to load
  // we should call subscribe ourselves
  if (isDisabled()
    || hasInitialized()
    || global.v12Failure === true) {
    const { V12 } = global
    subscribe(state, dispatch, V12)
    return
  }
  // if we made it here, v12 has not loaded quite yet,
  // so we assign the v12Configure function to the window for pickup
  global.v12Configure = (v12) => {
    subscribe(state, dispatch, v12)
  }
}

function subscribe (state, dispatch, v12) {
  // if v12 failed to load...
  if (global.v12Failure === true
    || v12.isDisabled()) {
    dispatch(setInitialState({
      failure: global.v12Failure,
      initialized: true,
      records: [],
      context: {},
    }))
    return
  }

  const user = get(state, 'user', Map())
  const auth = get(state, 'auth', Map())
  const userId = user.getIn(['data', 'uid'], undefined)
  const lang = user.getIn(['data', 'language'], List())
  const accountId = auth.get('userAccountId')
  const jwt = auth.get('jwt', '')
  const initialContext = {
    lang: lang.get(0, 'en'),
    client: 'WAP',
  }

  if (userId && userId > 0) {
    initialContext.user_id = userId
  }

  if (accountId) {
    initialContext.user_account = accountId
  }

  if (jwt) {
    initialContext.jwt = jwt
  }

  v12.setContext(() => (initialContext))

  dispatch(setInitialState({
    records: v12.getState('records', []),
    initialized: v12.hasInitialized(),
    context: v12.getContext(),
    failure: false,
  }))

  // listen for when V12 is initialized
  v12.addListener('resourcer.initialized', () => {
    dispatch(setInitialized(true))
  })
  // listen for context change
  v12.addListener('context.updated', (context) => {
    dispatch(setReduxContext(context))
  })
  // listen for records updating
  v12.addListener('records.updated', (records) => {
    dispatch(setRecords(records))
  })
}

function setV12Context (context) {
  const now = new Date()
  const state = assign({}, context)
  if (now.getHours() > stamp.getHours()) {
    stamp.setHours(now.getHours())
    set(state, 'local_date', stamp)
  }
  setContext(() => (state))
}

function loadTestarossa (scriptLoader, state, dispatch) {
  scriptLoader(`${serverTestarossa}assets/0.93.61/v12.js`, () => {
    const { V12 } = global

    // if V12 doesn't exist, then the script did not load
    if (!V12) {
      global.v12Failure = true
    }

    v12Configure(state, dispatch)
  })
}

export function configureV12 ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, async ({ state, dispatch }) => {
    const { default: scriptjs } = await import('scriptjs')
    const { app, auth, resolver } = state
    const authToken = auth.get('jwt')
    const uid = auth.get('uid')
    const testarossaEnabled = resolver.getIn(['query', 'testarossa_enabled'])
    let testarossaIsDisabled = false
    if (testarossaEnabled === 'false' || testarossaEnabled === '0') {
      testarossaIsDisabled = true
    }

    const phase = app.get('bootstrapPhase')
    if (phase === BOOTSTRAP_PHASE_INIT) {
      if (testarossaIsDisabled === true && global.sessionStorage) {
        global.sessionStorage.setItem(
          'testarossa_enabled', false)
      }

      if (!canSetCookie(uid, authToken) && dataPrivacyCompliance) {
        return
      }

      loadTestarossa(scriptjs, state, dispatch)
    }
  })
}

// -----------------------------------
// Watcher for checking when setCookieBannerAccepted is fired
// -----------------------------------
export function onTestarossaSetCookieBannerAccepted ({ after }) {
  return after(SET_COOKIE_BANNER_ACCEPTED, async ({ dispatch, state }) => {
    if (dataPrivacyCompliance && !global.v12Configure) {
      const { default: scriptjs } = await import('scriptjs')

      loadTestarossa(scriptjs, state, dispatch)
    }
  })
}

// -----------------------------------
// Watcher for checking when a user logs in
// -----------------------------------
export function onTestarossaSetAuthLoginSuccess ({ after }) {
  return after(SET_AUTH_LOGIN_SUCCESS, async ({ dispatch, state }) => {
    if (dataPrivacyCompliance) {
      const { auth } = state
      const loginSuccess = auth.get('loginSuccess')
      const { default: scriptjs } = await import('scriptjs')

      if (loginSuccess && !global.v12Configure) {
        loadTestarossa(scriptjs, state, dispatch)
      }
    }
  })
}

export function setPath ({ before }) {
  return before(SET_RESOLVER_LOCATION, ({ action, state }) => {
    const { payload = {} } = action
    const { location = {} } = payload
    const { pathname } = location
    const { user = Map() } = state
    const uid = user.getIn(['data', 'uid'], null)
    const languages = user.getIn(['data', 'language'], List())
    const context = { path: pathname }
    if (uid && uid > 0) {
      set(context, 'user_id', uid)
    }
    if (languages && languages.size) {
      set(context, 'lang', toLower(languages.get(0)))
    }
    setV12Context(context)
  })
}

export function setLang ({ before }) {
  return before([
    SET_USER_DATA_LANGUAGE,
    SET_USER_DATA_LANGUAGE_PRIMARY,
  ], ({ state, action }) => {
    let lang
    if (isNil(action)) {
      const user = get(state, 'user', Map())
      lang = user.getIn(['data', 'language'], List())
    } else {
      lang = get(action, ['payload', 'value'], 'en')
    }
    if (List.isList(lang)) {
      lang = lang.first()
    }
    setV12Context({
      lang: toLower(lang),
    })
  })
}

export function setInboundTracking ({ before }) {
  return before(SET_INBOUND_TRACKING_DATA_INITIALIZED, ({ action }) => {
    const { payload } = action
    const { data } = payload
    const utmCampaign = data.get('utm_campaign', null)
    if (utmCampaign) {
      setV12Context({
        utm_campaign: utmCampaign,
      })
    }
  })
}

export function setOnboardingChoices ({ before }) {
  return before(SET_ONBOARDING_COMPLETED, ({ state }) => {
    const { onboarding = Map() } = state
    const selection = onboarding.get('selection', Map())
    const tid = selection.get('tid')
    if (tid) {
      setV12Context({
        onboarding_choices: [tid],
      })
    }
  })
}

export function setUserId ({ before }) {
  return before(SET_AUTH_DATA, ({ action }) => {
    const { payload = {} } = action
    const { data = {} } = payload
    const { uid, jwt, userAccountId } = data
    if (uid && uid > 0) {
      setV12Context({
        user_account: userAccountId,
        user_id: uid,
        jwt,
      })
    }
  })
}

export function setSignup ({ before }) {
  return before(SET_CHECKOUT_ORDER_DATA, ({ action }) => {
    const { payload = {} } = action
    const { success, userIsNew, newUsername } = payload
    if (success && userIsNew && newUsername) {
      setV12Context({
        signup_complete: true,
      })
    }
  })
}
