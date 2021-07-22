import { List, fromJS } from 'immutable'
import { getMenuData } from 'services/menu/actions'
import { getStaticTextData } from 'services/static-text/actions'
import { getPlansData } from 'services/plans/actions'
import { getHomeData } from 'services/home/actions'
import { SET_AUTH_DATA } from 'services/auth/actions'
// import { get as getConfig } from 'config'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _isBoolean from 'lodash/isBoolean'
import _isUndefined from 'lodash/isUndefined'
import { getLocalPreferences, setLocalPreferences } from 'services/local-preferences'
import { getAuthIsLoggedIn } from 'services/auth'
import { LTM } from 'services/currency'
import {
  getUserData,
  SET_USER_DATA_LANGUAGE,
  SET_USER_DATA_LANGUAGE_PRIMARY,
  SET_USER_PROFILE_IMAGES,
  SET_USER_PROFILE_IMAGES_DELETE,
} from './actions'


// const { features } = getConfig()

function onUserDataLanguage (store, action) {
  if (_isUndefined(action.payload.value)) {
    return
  }
  // Delay these dispatches to give the store time to settle with new values.
  setTimeout(() => {
    const language = List.isList(action.payload.value)
      ? action.payload.value.first()
      : action.payload.value
    const options = { language }
    const plansOptions = { language }
    const { auth, user, userAccount } = store.getState()
    const dataLanguage = user.getIn(['data', 'language'])
    const localStorageUserData = getLocalPreferences(auth.get('uid'), 'user')
    const dataLanguageAlertBarAccepted = _get(localStorageUserData, ['data', 'languageAlertBarAccepted'], false)
    const userLocalStorage = {
      data: {
        language: dataLanguage,
        languageAlertBarAccepted: dataLanguageAlertBarAccepted,
      },
    }
    // Only set local storage values are defined
    const shouldSetLocalPreferences =
      (List.isList(dataLanguage) && dataLanguage.size > 0) ||
        _isBoolean(dataLanguageAlertBarAccepted)
    const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
    const latamPricing = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'latamPricing'])
    const currency = latamPricing ? LTM : currencyIso
    store.dispatch(getMenuData(options))
    store.dispatch(getStaticTextData(language))
    store.dispatch(getHomeData(options))
    if (getAuthIsLoggedIn(auth) && currency) {
      _set(plansOptions, 'currency', currency)
      store.dispatch(getPlansData(plansOptions))
    } else {
      store.dispatch(getPlansData(plansOptions))
    }
    if (shouldSetLocalPreferences) {
      setLocalPreferences({ uid: auth.get('uid') }, 'user', userLocalStorage, auth)
    }
  }, 0)
}

function onAuthData (store, action) {
  const auth = fromJS(action.payload.data)
  if (getAuthIsLoggedIn(auth)) {
    store.dispatch(getUserData({ auth }))
  }
}

function onUserProfileImageUpdate (store, action) {
  const profileImageData = fromJS(action.payload.data)
  const { auth } = store.getState()
  if (getAuthIsLoggedIn(auth) && profileImageData.get('success')) {
    store.dispatch(getUserData({ auth }))
  }
}

/**
 * Update the document data-lang attribute in the browser when the user language is
 * different
 * @param {Object} state The state after all actions have been processed
 */
function onStateUserDataLanguage (state) {
  const { user } = state
  const { document = {} } = global
  const { documentElement } = document
  if (!documentElement) {
    return
  }
  const lang = user.getIn(['data', 'language']) || List()
  const primaryLang = lang.get(0, 'en')
  if (documentElement.getAttribute('data-lang') !== primaryLang) {
    documentElement.setAttribute('data-lang', primaryLang)
  }
}

export default function middleware (store) {
  return next => (action) => {
    switch (action.type) {
      case SET_AUTH_DATA:
        onAuthData(store, action)
        break
      case SET_USER_DATA_LANGUAGE:
      case SET_USER_DATA_LANGUAGE_PRIMARY:
        onUserDataLanguage(store, action)
        break
      case SET_USER_PROFILE_IMAGES:
      case SET_USER_PROFILE_IMAGES_DELETE:
        onUserProfileImageUpdate(store, action)
        break
      default:
        break
    }
    next(action)
    // Capture state after store updates
    const state = store.getState()
    onStateUserDataLanguage(state)
  }
}
