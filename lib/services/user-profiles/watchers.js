import get from 'lodash/get'
import parseInt from 'lodash/parseInt'
import { List, fromJS } from 'immutable'
import { enableRoutes } from 'services/app/actions'
import { SET_USER_DATA } from 'services/user/actions'
import { resetOnboarding } from 'services/onboarding/actions'
import { INTERSTITIAL_SELECT_PROFILE } from 'services/interstitial'
import { SET_CHECKOUT_ORDER_DATA } from 'services/checkout/actions'
import { AUTH_LOGOUT, changeAuthProfile } from 'services/auth/actions'
import { removeInterstitial, setInterstitial } from 'services/interstitial/actions'
import { setSessionStorage, clearSessionStorage } from 'services/local-preferences'

import {
  PROMPT_PROFILE_SELECTOR_KEY,
  removeProfileFromAccount,
  initializePrompt,
  postUserProfile,
  getProfiles,
} from '.'

import {
  getProfiles as getProfilesAction,
  USER_PROFILES_SET_PROMPT,
  USER_PROFILES_CREATED,
  USER_PROFILES_SELECT,
  USER_PROFILES_REMOVE,
  USER_PROFILES_CREATE,
  USER_PROFILES_SET,
  USER_PROFILES_GET,
  showPrompt,
} from './actions'

export function watchLogout ({ before }) {
  return before(AUTH_LOGOUT, () => {
    clearSessionStorage(PROMPT_PROFILE_SELECTOR_KEY)
  })
}

export function watchUserData ({ before }) {
  return before(SET_USER_DATA, ({ state, action, dispatch }) => {
    const { auth, user } = state
    const jwt = auth.get('jwt')
    const uid = get(action, 'payload.data.account_owner_uid')
    if (uid !== user.getIn(['data', 'account_owner_uid'])) {
      dispatch(getProfilesAction(jwt))
    }
  })
}

export function watchSetOrderData ({ before }) {
  return before(SET_CHECKOUT_ORDER_DATA, ({ dispatch }) => {
    dispatch(showPrompt(false))
  })
}

export function watchShowPrompt ({ before }) {
  return before(USER_PROFILES_SET_PROMPT, ({ dispatch, action }) => {
    const { payload: show } = action
    const result = show
      ? setInterstitial(INTERSTITIAL_SELECT_PROFILE)
      : removeInterstitial(INTERSTITIAL_SELECT_PROFILE)
    setSessionStorage(PROMPT_PROFILE_SELECTOR_KEY, show)
    dispatch(result)
  })
}

// core watcher to fetch the user profiles
export function watchGetProfiles ({ takeLatest }) {
  return takeLatest(USER_PROFILES_GET, async ({ state, action }) => {
    const { auth, resolver, featureTracking } = state
    const { payload: nextAuth } = action
    const { data } = await getProfiles(nextAuth || auth)
    const dismissed = featureTracking.getIn(['data', 'dismissedProfileChooser'])
    const promptProfileSelector = initializePrompt({
      resolverType: resolver.getIn(['data', 'type'], ''),
      pathname: resolver.get('path'),
      preference: dismissed,
      profiles: data,
    })
    return {
      payload: { promptProfileSelector, data },
      type: USER_PROFILES_SET,
    }
  })
}

// watcher for when a profile is selected from the
// multiple profile selector screen
export function watchSelectProfile ({ after }) {
  return after(USER_PROFILES_SELECT, async ({ state, action, dispatch }) => {
    const { userProfiles, auth } = state
    const { payload: index } = action
    const indexInt = parseInt(index)
    const profile = userProfiles.getIn(['data', indexInt])

    if (profile) {
      const uid = parseInt(profile.get('uid'))
      const userAccountId = profile.get('user_account_id')

      if (uid !== auth.get('uid')) {
        dispatch(resetOnboarding())
        dispatch(changeAuthProfile({ userAccountId, auth, uid }))
      } else {
        dispatch(enableRoutes())
      }
      dispatch(showPrompt(false))
    }
  })
}

// for when a new profile is created
export function watchCreateUserProfile ({ takeFirst }) {
  return takeFirst(USER_PROFILES_CREATE, async ({ state, action }) => {
    const { userProfiles } = state
    const { payload } = action
    const { data, error, message } = await postUserProfile(payload)
    const profiles = userProfiles.get('data', List())
    return {
      type: USER_PROFILES_CREATED,
      payload: {
        data: data ? profiles.push(fromJS(data)) : profiles,
        message,
        error,
      },
    }
  })
}

// for when a profile is removed
export function watchRemoveProfile ({ takeFirst }) {
  return takeFirst(USER_PROFILES_REMOVE, async ({ state, action }) => {
    const { userProfiles } = state
    const { payload } = action
    const { data = {}, error, message } = await removeProfileFromAccount(payload)
    const profiles = userProfiles.get('data', List())
    const { uid } = data
    return {
      type: USER_PROFILES_SET,
      payload: {
        data: error ? null : profiles.filter(p => p.get('uid') !== uid),
        message,
        error,
      },
    }
  })
}
