export const SET_OPTIMIZELY_ACTIVE_PAGE = 'SET_OPTIMIZELY_ACTIVE_PAGE'
export const SET_OPTIMIZELY_USER_ATTRIBUTES = 'SET_OPTIMIZELY_USER_ATTRIBUTES'
export const SET_OPTIMIZELY_EXPERIMENT_DECISION =
  'SET_OPTIMIZELY_EXPERIMENT_DECISION'
export const SET_OPTIMIZELY_EVENT = 'SET_OPTIMIZELY_EVENT'
export const SET_OPTIMIZELY_DISABLED = 'SET_OPTIMIZELY_DISABLED'
export const NO_PAGE_NAME_FOUND = 'NO_PAGE_NAME_FOUND'
export const NO_EVENT_TYPE_FOUND = 'NO_EVENT_TYPE_FOUND'

export function setOptimizelyActivePage (pageName) {
  return {
    type: SET_OPTIMIZELY_ACTIVE_PAGE,
    payload: { pageName },
  }
}

export function setOptimizelyUserAttributes (attributes) {
  return {
    type: SET_OPTIMIZELY_USER_ATTRIBUTES,
    payload: { attributes },
  }
}

export function setOptimizelyEvent (eventType, tags) {
  return {
    type: SET_OPTIMIZELY_EVENT,
    payload: { eventType, tags },
  }
}

export function setOptimizelyExperimentDecision (decision) {
  return {
    type: SET_OPTIMIZELY_EXPERIMENT_DECISION,
    payload: { decision },
  }
}

export function setOptimizelyDisabled (value) {
  return {
    type: SET_OPTIMIZELY_DISABLED,
    payload: value,
  }
}
