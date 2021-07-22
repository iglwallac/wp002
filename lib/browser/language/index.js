import _first from 'lodash/first'
import _split from 'lodash/split'
import { List, Map } from 'immutable'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import { setAlertBarVisible, setAlertBarData } from 'services/alert-bar/actions'
import {
  getUserDataLanguageAlertBarAccepted,
  getUserDataLanguage,
} from 'services/user/actions'

/**
 * Show an alert if anonymous user has a different language then the page
 */
export async function init (options) {
  const {
    auth,
    store,
    user,
  } = options

  // only present this to a user once
  let languageAlertBarAccepted = await getUserDataLanguageAlertBarAccepted(auth)(store.dispatch)
  let userDataLanguage = await getUserDataLanguage(auth)(store.dispatch)

  // overwrite with user, if there was nothing in local storage
  if (!languageAlertBarAccepted) {
    languageAlertBarAccepted = user.getIn(['data', 'languageAlertBarAccepted'])
  }

  if (!userDataLanguage || (List.isList(userDataLanguage) && userDataLanguage.size === 0)) {
    userDataLanguage = user.getIn(['data', 'language'])
  }

  if (languageAlertBarAccepted) {
    return
  }

  const userPrimaryLanguage = getPrimaryLanguage(userDataLanguage, List())
  const browserLanguage = getBrowserLanguage()

  // Show an alert if anonymous user has a different language then the page
  if (!auth.get('jwt') && browserLanguage && userPrimaryLanguage !== browserLanguage) {
    store.dispatch(setAlertBarVisible(true))
    store.dispatch(setAlertBarData(Map({
      anonymousLanguage: true,
    })))
  }
}

export function getBrowserLanguage () {
  const navigatorLanguage = (navigator.languages && navigator.languages[0]) ||
    navigator.language || navigator.userLanguage
  return navigatorLanguage.length > 2 ? _first(_split(navigatorLanguage, '-')) : navigatorLanguage
}

export default {
  init,
}
