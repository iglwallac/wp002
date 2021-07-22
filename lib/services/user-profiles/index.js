import _get from 'lodash/get'
import { get as apiGet, post as apiPost, put as apiPut, TYPE_BROOKLYN_JSON } from 'api-client'
import { getSessionStorage, setSessionStorage } from 'services/local-preferences'
import { RESOLVER_TYPE_NOT_FOUND } from 'services/resolver/types'

const PATH_EXP = /(\/logout|plan|cart|share|events|account|checkout|get-started|live-access|terms-privacy|dev\/kitchen-sink)/i

export const MAX_PROFILES = 3
export const PROMPT_PROFILE_SELECTOR_KEY = 'PROMPT_PROFILE_SELECTOR'

export function initializePrompt ({ pathname, profiles, preference, resolverType }) {
  let shouldPrompt = false
  if (!PATH_EXP.test(pathname)
    && resolverType !== RESOLVER_TYPE_NOT_FOUND
    && profiles && profiles.length > 0) {
    const sessionValue = getSessionStorage(PROMPT_PROFILE_SELECTOR_KEY, true)
    shouldPrompt = profiles.length > 1 ? sessionValue : (sessionValue && !preference)
  }
  setSessionStorage(PROMPT_PROFILE_SELECTOR_KEY, shouldPrompt)
  return shouldPrompt
}

export async function postUserProfile (data) {
  try {
    const { auth } = data
    const res = await apiPost('v1/create-user-profile', data, { auth }, TYPE_BROOKLYN_JSON)
    const body = _get(res, 'body')

    if (!body) {
      throw new Error('Error creating user profiles, no response body')
    }

    if (_get(body, 'errors')) {
      const message = _get(res, 'body.errors[0].detail', 'Error creating profile')
      throw new Error(message)
    }
    return { data: body }
  } catch (e) {
    return {
      message: e.message,
      error: true,
    }
  }
}

export async function removeProfileFromAccount (data) {
  try {
    const { value } = data
    const { auth, profile } = value
    const res = await apiPut('v1/remove-user-profile', profile, { auth }, TYPE_BROOKLYN_JSON)
    const body = _get(res, 'body')

    if (!body) {
      throw new Error('Error removing user profiles, no response body')
    }
    return { data: body }
  } catch (e) {
    return {
      message: e.message,
      error: true,
    }
  }
}

export async function getProfiles (auth) {
  try {
    const res = await apiGet('v1/user-account', null, { auth }, TYPE_BROOKLYN_JSON)
    return { data: _get(res, 'body', []) }
  } catch (e) {
    return { data: [] }
  }
}
