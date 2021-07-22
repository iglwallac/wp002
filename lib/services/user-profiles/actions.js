export const USER_PROFILES_SET_PROMPT = 'USER_PROFILES_SET_PROMPT'
export const USER_PROFILES_CREATED = 'USER_PROFILES_CREATED'
export const USER_PROFILES_SELECT = 'USER_PROFILES_SELECT'
export const USER_PROFILES_CREATE = 'USER_PROFILES_CREATE'
export const USER_PROFILES_REMOVE = 'USER_PROFILES_REMOVE'
export const USER_PROFILES_SET = 'USER_PROFILES_SET'
export const USER_PROFILES_GET = 'USER_PROFILES_GET'

export function createProfile (value) {
  return {
    type: USER_PROFILES_CREATE,
    payload: value,
  }
}

export function removeProfile (value) {
  return {
    type: USER_PROFILES_REMOVE,
    payload: { value },
  }
}

export function getProfiles (auth = null) {
  return {
    type: USER_PROFILES_GET,
    payload: auth,
  }
}

export function selectProfile (index) {
  return {
    type: USER_PROFILES_SELECT,
    payload: index,
  }
}

export function showPrompt (bool) {
  return {
    type: USER_PROFILES_SET_PROMPT,
    payload: bool,
  }
}
