export const COMMUNITY_DELETE_DRAFT_ATTACHMENT = 'COMMUNITY_DELETE_DRAFT_ATTACHMENT'
export const COMMUNITY_DELETE_DRAFT_OPENGRAPH = 'COMMUNITY_DELETE_DRAFT_OPENGRAPH'
export const COMMUNITY_ADD_DRAFT_OPENGRAPHS = 'COMMUNITY_ADD_DRAFT_OPENGRAPHS'
export const COMMUNITY_ADD_DRAFT_PHOTOS = 'COMMUNITY_ADD_DRAFT_PHOTOS'
export const COMMUNITY_DELETE_DRAFT = 'COMMUNITY_DELETE_DRAFT'
export const COMMUNITY_UPDATE_DRAFT = 'COMMUNITY_UPDATE_DRAFT'
export const COMMUNITY_SET_DRAFT = 'COMMUNITY_SET_DRAFT'

export const COMMUNITY_REMOVE_ACTIVITY = 'COMMUNITY_REMOVE_ACTIVITY'
export const COMMUNITY_GET_ACTIVITY = 'COMMUNITY_GET_ACTIVITY'
export const COMMUNITY_SET_ACTIVITY = 'COMMUNITY_SET_ACTIVITY'
export const COMMUNITY_ADD_ACTIVITY = 'COMMUNITY_ADD_ACTIVITY'

export const COMMUNITY_REMOVE_REACTION = 'COMMUNITY_REMOVE_REACTION'
export const COMMUNITY_ADD_REACTION = 'COMMUNITY_ADD_REACTION'

export const COMMUNITY_FETCH_ACTIVITIES = 'COMMUNITY_FETCH_ACTIVITIES'
export const COMMUNITY_SET_ACTIVITIES = 'COMMUNITY_SET_ACTIVITIES'
export const COMMUNITY_CONNECT_FEED = 'COMMUNITY_CONNECT_FEED'
export const COMMUNITY_SET_FEED = 'COMMUNITY_SET_FEED'

export const COMMUNITY_UNMOUNT_PAGE = 'COMMUNITY_UNMOUNT_PAGE'

/**
 * Connects a feed
 * @param {Object} options - the options
 * @param {String} options.id - Feed id
 */
export function connectFeed (options) {
  return {
    type: COMMUNITY_CONNECT_FEED,
    payload: options,
  }
}

/**
 * Fetch feed activities
 * @param {Object} options - the options
 * @param {String} options.id - Feed id /// changing to value
 * @param {String} options.activityId - activityId offset
 */
export function fetchActivities (options) {
  return {
    type: COMMUNITY_FETCH_ACTIVITIES,
    payload: options,
  }
}

/**
 * Creates an activity
 * @param {Object} options - the options
 * @param {String} options.draftId - A draft id of the activity lives in a draft state
 */
export function addActivity (options) {
  return {
    type: COMMUNITY_ADD_ACTIVITY,
    payload: options,
  }
}

/**
 * Gets an activity
 * @param {Object} options - the options
 * @param {String} options.uuid - Uuid of the activity
 */
export function getActivity (options) {
  return {
    type: COMMUNITY_GET_ACTIVITY,
    payload: options,
  }
}

/**
 * Removes an activity
 * @param {Object} options - the options
 * @param {String} options.uuid - uuid of activity to be removed
 */
export function removeActivity (options) {
  return {
    type: COMMUNITY_REMOVE_ACTIVITY,
    payload: options,
  }
}

/**
 * Creates a reaction
 * @param {Object} options - the options
 * @param {String} options.activityUuid - A uuid of the activity being reacted to
 * @param {String} options.type - Type of reaction ie. LIKED
 */
export function addReaction (options) {
  return {
    type: COMMUNITY_ADD_REACTION, // activityuuid and 'LIKED' called activity and type in brooklyn
    payload: options,
  }
}

/**
 * Removes a reaction
 * @param {Object} options - the options
 * @param {String} options.uuid - uuid of reaction to be removed
 */
export function removeReaction (options) {
  return {
    type: COMMUNITY_REMOVE_REACTION,
    payload: options,
  }
}

/**
 * Puts a draft into the draft state
 * @param {String} draftId - the draftId
 * @param {import('immutable').Map} draft - the draft to be stored
 */
export function setDraft (draftId, draft) {
  return {
    type: COMMUNITY_SET_DRAFT,
    payload: { draftId, draft },
  }
}

/**
 * Sets a temporary Map in state.community.drafts for state and later use
 * @param {String} draftId - The unique id for the draft
 * @param {Object} attributes - key/value pairs to add to the draft
 */
export function updateDraft (draftId, attributes) {
  return {
    type: COMMUNITY_UPDATE_DRAFT,
    payload: { draftId, attributes },
  }
}

/**
 * Removes a draft activity from redux state
 * @param {String} draftId - The unique id for the draft
 */
export function deleteDraft (draftId) {
  return {
    type: COMMUNITY_DELETE_DRAFT,
    payload: { draftId },
  }
}

/**
 * adds photos to a draft
 * @param {String} draftId - the draftId
 * @param {Object[]} photos - photo file upload data uris
 */
export function addDraftPhotos (draftId, { photos }) {
  return {
    type: COMMUNITY_ADD_DRAFT_PHOTOS,
    payload: { draftId, photos },
  }
}

/**
 * adds opengraphs to a draft
 * @param {String} draftId - the draftId
 * @param {String} text - text blob to parse
 */
export function addDraftOpenGraphs (draftId, { value }) {
  return {
    type: COMMUNITY_ADD_DRAFT_OPENGRAPHS,
    payload: { draftId, value },
  }
}

/**
 * Marks a draft open graph as invalid so it will not be posted
 * @param {String} draftId - The unique id for the activity
 * @param {String} graphId - The open graph id
 */
export function deleteDraftOpenGraph (draftId, graphId) {
  return {
    type: COMMUNITY_DELETE_DRAFT_OPENGRAPH,
    payload: { draftId, graphId },
  }
}

/**
 * Removes a draft attachment
 * @param {String} draftId - The unique id for the activity
 * @param {Object} options - options
 * @param {String} options.attachmentId - the attachment file id
 * @param {String} options.path - the attachment path
 */
export function deleteDraftAttachment (draftId, { attachmentId, path }) {
  return {
    type: COMMUNITY_DELETE_DRAFT_ATTACHMENT,
    payload: { draftId, attachmentId, path },
  }
}

/**
 * unmounts community page data from store.
 * Will leave things like auth intact for other pages.
 */
export function unmountPage () {
  return { type: COMMUNITY_UNMOUNT_PAGE }
}
