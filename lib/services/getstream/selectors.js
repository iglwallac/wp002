import { Map, List } from 'immutable'

export const EMPTY_MAP = Map()
export const EMPTY_LIST = List()
export const EMPTY_OBJECT = {}

/**
 * selects the getstream authentication data
 * @param {Object} state - redux state.getstream
 */
export function selectAuth (state) {
  return state.get('auth', EMPTY_MAP)
}

/**
 * is user forbidden from global access to community
 * @param {Object} state - redux state.getstream
 */
export function selectAuthForbidden (state) {
  const auth = selectAuth(state)
  return auth.get('forbidden') === true
}

/**
 * is user allowed global access to community
 * @param {Object} state - redux state.getstream
 */
export function selectAuthAllowed (state) {
  const auth = selectAuth(state)
  return auth.get('forbidden') === false
}

/**
 * are we currently createing a session ?
 * @param {Object} state - redux state.getstream
 */
export function selectAuthProcessing (state) {
  const auth = selectAuth(state)
  return auth.get('processing') === true
}

/**
 * select getstream feed data
 * @param {Object} state - redux state.getstream
 * @param {String} key - the feed store key
 */
export function selectFeed (state, key) {
  return state.getIn(['feed', key], EMPTY_MAP)
}

/**
 * select getstream main feed data
 * @param {Object} state - redux state.getstream
 */
export function selectMainFeed (state) {
  return selectFeed(state, 'main')
}

/**
 * finds a draft in the redux getstream store
 * @param {Object} state - redux getstream state
 * @param {String} draftId - the draft id
 */
export function selectDraft (state, draftId, fallback) {
  return state.getIn(['drafts', draftId], fallback)
}

/**
 * gets an activity from the store
 * @param {Object} state - redux getstream state
 * @param {String} activityId - an immutable activity
 */
export function selectActivity (state, activityId) { // activities are not currently immutable
  return state.getIn(['activities', activityId], EMPTY_OBJECT)
}

/**
 * finds an activities photo attachments
 * @param {import('immutable').Map} activity - an immutable activity
 */
export function selectActivityPhotos (activity = EMPTY_MAP) {
  return activity.getIn(['attachments', 'images']) || EMPTY_LIST
}

/**
 * finds an activities open graphs
 * @param {import('immutable').Map} activity - an immutable activity
 */
export function selectActivityOGs (activity = EMPTY_MAP) {
  return activity.getIn(['attachments', 'og']) || EMPTY_LIST
}

/**
 * finds an activities open graphs that are renderable
 * @param {import('immutable').Map} activity - an immutable activity
 */
export function selectRenderableActivityOGs (activity = EMPTY_MAP) {
  const ogs = selectActivityOGs(activity)
  return ogs.filter(og => og.get('render'))
}
