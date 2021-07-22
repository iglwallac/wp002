import { Map, List } from 'immutable'
import { createDraft } from './draft'

export const EMPTY_MAP = Map()
export const EMPTY_LIST = List()
export const EMPTY_OBJECT = {}

/**
 * select community feed data from the store
 * @param {Object} state - redux community state
 * @param {String} id - the feed id (ie main)
*/
export function selectFeed (state, id) {
  const feeds = state.get('feeds', Map())
  let feed = Map()
  if (feeds && feeds.size > 0) {
    feeds.keySeq().forEach((key) => {
      if (key === id) {
        feed = feeds.get(key)
      }
    })
  }
  return feed
}

/**
 * finds a draft in the redux community store
 * @param {Object} state - redux community state
 * @param {String} draftId - the draft id
*/
export function selectDraft (state, draftId, parent, type) {
  return state.getIn(['drafts', draftId], createDraft(parent, type))
}

/**
 * gets an activity from the store
 * @param {Object} state - redux community state
 * @param {String} activityId - an immutable activity
*/
export function selectActivity (state, activityId) {
  return state.getIn(['activity', activityId], EMPTY_MAP)
}

/**
 * finds an activity draft's image attachments
 * @param {import('immutable').Map} activity - an immutable activity
*/
export function selectDraftImages (activity = EMPTY_MAP) {
  return activity.getIn(['attachments', 'images']) || EMPTY_LIST
}

/**
 * finds an activity draft's opengraphs
 * @param {import('immutable').Map} activity - an immutable activity
*/
export function selectDraftOpengraphs (activity = EMPTY_MAP) {
  return activity.getIn(['attachments', 'opengraph']) || EMPTY_LIST
}

/**
 * finds an activity draft's opengraphs that are renderable
 * @param {import('immutable').Map} activity - an immutable activity
*/
export function selectRenderableDraftOpengraphs (activity = EMPTY_MAP) {
  const ogs = selectDraftOpengraphs(activity)
  return ogs.filter(og => og.get('render'))
}

/**
 * resolves an activities feed from an activity's jsonAPI data
 * @param {import('immutable').Map} data - an immutable activity's data
 * @param {import('immutable').List} included - an immutable activity's related records
*/
export function selectActivityFeedId (included) {
  return included.find(i => i.get('type') === 'FEED').get('value', '')
}

/**
 * resolves an activities author from an activity's jsonAPI data
 * @param {import('immutable').Map} data - an immutable activity's data
 * @param {import('immutable').List} included - an immutable activity's related records
*/
export function selectActivityAuthor (data, included) {
  const authorId = data.getIn(['relationships', 'author', 'uuid'])
  return included.find(i => i.get('uuid') === authorId)
}

/**
 * resolves an activities opengraphs from an activity's jsonAPI data
 * @param {import('immutable').Map} data - an immutable activity's data
 * @param {import('immutable').List} included - an immutable activity's related records
*/
export function selectActivityOpengraphs (data, included) {
  const opengraphIds = data.getIn(['relationships', 'opengraphs'], List()).map(graph => graph.get('uuid'))
  return opengraphIds.map(opengraphId => included.find(i => i.get('uuid') === opengraphId))
}

/**
 * resolves an activities images from an activity's jsonAPI data
 * @param {import('immutable').Map} data - an immutable activity's data
 * @param {import('immutable').List} included - an immutable activity's related records
*/
export function selectActivityImages (data, included) {
  const imagesIds = data.getIn(['relationships', 'images'], List()).map(image => image.get('uuid'))
  return imagesIds.map(imageId => included.find(i => i.get('uuid') === imageId))
}

/**
 * selects an activity node from an activity's jsonAPI data
 * @param {import('immutable').Map} data - an immutable activity's data
 * @param {import('immutable').List} included - an immutable activity's related records
*/
export function selectActivityNode (data, included) {
  return included.find(i => i.get('uuid') === data.get('uuid'))
}

