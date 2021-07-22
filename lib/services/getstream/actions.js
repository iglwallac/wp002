import { Map } from 'immutable'

export const GETSTREAM_GET_ACTIVITY_REACTIONS_REQUEST = 'GETSTREAM_GET_ACTIVITY_REACTIONS_REQUEST'
export const GETSTREAM_GET_ACTIVITY_REACTIONS_ERROR = 'GETSTREAM_GET_ACTIVITY_REACTIONS_ERROR'
export const GETSTREAM_GET_ACTIVITY_REACTIONS_SUCCESS = 'GETSTREAM_GET_ACTIVITY_REACTIONS_SUCCESS'
export const GETSTREAM_DO_CHILD_REACTION_REQUEST = 'GETSTREAM_DO_CHILD_REACTION_REQUEST'
export const GETSTREAM_DO_CHILD_REACTION_SUCCESS = 'GETSTREAM_DO_CHILD_REACTION_SUCCESS'
export const GETSTREAM_DO_CHILD_REACTION_ERROR = 'GETSTREAM_DO_CHILD_REACTION_ERROR'

export const GETSTREAM_UNMOUNT_PAGE = 'GETSTREAM_UNMOUNT_PAGE'

export const GETSTREAM_ADD_DRAFT_PHOTOS = 'GETSTREAM_ADD_DRAFT_PHOTOS'
export const GETSTREAM_DELETE_DRAFT_PHOTOS = 'GETSTREAM_DELETE_DRAFT_PHOTOS'
export const GETSTREAM_ADD_DRAFT_OPENGRAPHS = 'GETSTREAM_ADD_DRAFT_OPENGRAPHS'
export const GETSTREAM_DELETE_DRAFT_OPENGRAPH = 'GETSTREAM_DELETE_DRAFT_OPENGRAPH'
export const GETSTREAM_DELETE_DRAFT_ATTACHMENT = 'GETSTREAM_DELETE_DRAFT_ATTACHMENT'
export const GETSTREAM_UPDATE_DRAFT = 'GETSTREAM_UPDATE_DRAFT'
export const GETSTREAM_DELETE_DRAFT = 'GETSTREAM_DELETE_DRAFT'
export const GETSTREAM_PUT_DRAFT = 'GETSTREAM_PUT_DRAFT'

export const GETSTREAM_GET_NOTIFICATIONS_REQUEST = 'GETSTREAM_GET_NOTIFICATIONS_REQUEST'
export const GETSTREAM_GET_NOTIFICATIONS_SUCCESS = 'GETSTREAM_GET_NOTIFICATIONS_SUCCESS'
export const GETSTREAM_PUT_NOTIFICATIONS_SEEN = 'GETSTREAM_PUT_NOTIFICATIONS_SEEN'
export const GETSTREAM_SET_NOTIFICATIONS_SEEN = 'GETSTREAM_SET_NOTIFICATIONS_SEEN'
export const GETSTREAM_SET_NOTIFICATION_READ = 'GETSTREAM_SET_NOTIFICATION_READ'
export const GETSTREAM_PUT_NOTIFICATION_READ = 'GETSTREAM_PUT_NOTIFICATION_READ'

export const GETSTREAM_REMOVE_ACTIVITY = 'GETSTREAM_REMOVE_ACTIVITY'
export const GETSTREAM_GET_ACTIVITY = 'GETSTREAM_GET_ACTIVITY'
export const GETSTREAM_PUT_ACTIVITY = 'GETSTREAM_PUT_ACTIVITY'
export const GETSTREAM_ADD_ACTIVITY = 'GETSTREAM_ADD_ACTIVITY'

export const GETSTREAM_REMOVE_REACTION = 'GETSTREAM_REMOVE_REACTION'
export const GETSTREAM_ADD_REACTION = 'GETSTREAM_ADD_REACTION'

export const GETSTREAM_CREATE_SESSION = 'GETSTREAM_CREATE_SESSION'
export const GETSTREAM_RENEW_SESSION = 'GETSTREAM_RENEW_SESSION'
export const GETSTREAM_END_SESSION = 'GETSTREAM_END_SESSION'
export const GETSTREAM_SET_SESSION = 'GETSTREAM_SET_SESSION'

export const GETSTREAM_GET_FEED = 'GETSTREAM_GET_FEED'
export const GETSTREAM_PUT_FEED = 'GETSTREAM_PUT_FEED'

export function getActivityReactions (payload = Map()) {
  return {
    type: GETSTREAM_GET_ACTIVITY_REACTIONS_REQUEST,
    payload,
  }
}

export function doToggleChildReactions (payload = Map()) {
  return {
    type: GETSTREAM_DO_CHILD_REACTION_REQUEST,
    payload,
  }
}

/**
 * unmounts community page data from store.
 * Will leave things like auth intact for other pages.
 */
export function unmountPage () {
  return { type: GETSTREAM_UNMOUNT_PAGE }
}

/**
 * renews the current getstream user session.
 */
export function renewSession () {
  return { type: GETSTREAM_RENEW_SESSION }
}

/**
 * Ends the current getstream user session,
 * resets the client and removes user from store.
 */
export function endSession () {
  return { type: GETSTREAM_END_SESSION }
}

/**
 * Creates a getstream session for a Gaia user based on the Gaia auth.
 * will return getstream api token, appId, key, and expiration.
 * @param {Object|String} auth Gaia Authentication
 */
export function createSession (auth) {
  return {
    type: GETSTREAM_CREATE_SESSION,
    payload: { auth },
  }
}

/**
 * Puts Getstream feed information into the store
 * TODO: This action is not complete.
 * @param {Object} options The options
 * @param {String} options.type The type of feed (MAIN, USER, CONTENT)
 * @param {String} options.slug The feed category or 'slug'
 * @param {Object} options.userId userId the feed belongs to
 */
export function getFeed (options) {
  return {
    type: GETSTREAM_GET_FEED,
    payload: options,
  }
}

/**
 * Puts Getstream feed information into the store
 * @param {Object} options The options
 * @param {String} options.id The store key identifier
 * @param {Object} options.data Getstream feed data
 */
export function putFeed (options) {
  return {
    type: GETSTREAM_PUT_FEED,
    payload: options,
  }
}

/**
 * Gets an activity
 * @param {Object} options - the options
 * @param {String} options.id - the activity id
 */
export function getActivity (options) {
  return {
    type: GETSTREAM_GET_ACTIVITY,
    payload: options,
  }
}

/**
 * Puts an activity in the store
 * @param {String} activityId - the activity id
 * @param {Object} actvity - the activity
 */
export function putActivity (activityId, activity) {
  return {
    type: GETSTREAM_PUT_ACTIVITY,
    payload: { activityId, activity },
  }
}

/**
 * Creates an activity
 * @param {Object} options - the options
 * @param {String} options.targetFeeds - Array of Getstream feeds that will reference this activity
 * @param {String} options.feedGroup - The Getstream feed group associated with the Activity Feed
 * @param {String} options.feedId - The Getstream feed id (also called a userId in Getstream land)
 * @param {String} options.actvityId - A draft id of the activity lives in a draft state
 */
export function addActivity (options) {
  return {
    type: GETSTREAM_ADD_ACTIVITY,
    payload: options,
  }
}

/**
 * Creates a reaction
 * @param {Object} options - the options
 * @param {String} options.draftId - The draftId of the reaction //del others
 *  @param {String} options.activityId - The activityId of activity reacted to
 * @param {String} options.targetFeeds - Array of Getstream feeds that will reference this activity
 * @param {String} options.kind - The reaction kind (ie. 'like' or 'comment' etc.)
 * @param {String} options.data - The object with data (for comment reaction, contains text)
 */
export function addReaction (options) {
  return {
    type: GETSTREAM_ADD_REACTION,
    payload: options,
  }
}

/**
 * Removes an activity
 * @param {Object} options - the options
 * @param {String} options.feedGroup - The Getstream feed group associated with Activity Feed
 * @param {String} options.feedId - The Getstream feed id (also called a userId in Getstream land)
 * * @param {String} options.activity - activity to be removed
 */
export function removeActivity (options) {
  return {
    type: GETSTREAM_REMOVE_ACTIVITY,
    payload: options,
  }
}

/**
 * Removes a reaction
 * @param {Object} options - the options
 * * @param {String} options.userReaction - userReaction to be removed
 * * * @param {String} options.activity - activity reaction is associated with
 */
export function removeReaction (options) {
  return {
    type: GETSTREAM_REMOVE_REACTION,
    payload: options,
  }
}

/**
 * Puts an activity or reaction draft into the draft state
 * @param {String} draftId - the draftId
 * @param {import('immutable').Map} draft - the activity or reaction draft to be stored
 */
export function putDraft (draftId, draft) {
  return {
    type: GETSTREAM_PUT_DRAFT,
    payload: { draftId, draft },
  }
}

/**
 * Sets a temporary Map in state.getstream.drafts for state and later use
 * @param {String} draftId - The unique id for the draft
 * @param {Object} attributes - key/value pairs to add to the  draft
 */
export function updateDraft (draftId, attributes) {
  return {
    type: GETSTREAM_UPDATE_DRAFT,
    payload: { draftId, attributes },
  }
}

/**
 * Removes a draft activity from redux state
 * @param {String} draftId - The unique id for the draft
 */
export function deleteDraft (draftId) {
  return {
    type: GETSTREAM_DELETE_DRAFT,
    payload: { draftId },
  }
}

/**
 * adds photos to a draft
 * @param {String} draftId - the draftId
 * @param {Object[]} photos - photo file upload objects
 */
export function addDraftPhotos (draftId, { type, photos }) {
  return {
    type: GETSTREAM_ADD_DRAFT_PHOTOS,
    payload: { draftId, type, photos },
  }
}

/**
 * adds photos to a draft
 * @param {String} draftId - the draftId
 * @param {String} text - text blob to parse
 */
export function addDraftOpenGraphs (draftId, { type, text }) {
  return {
    type: GETSTREAM_ADD_DRAFT_OPENGRAPHS,
    payload: { draftId, type, text },
  }
}

/**
 * Marks a draft open graph as invalid so it will not be posted
 * @param {String} draftId - The unique id for the activity
 * @param {String} graphId - The open graph id
 */
export function deleteDraftOpenGraph (draftId, graphId) {
  return {
    type: GETSTREAM_DELETE_DRAFT_OPENGRAPH,
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
export function deleteDraftAttachment (draftId, { attachmentId, path, src }) {
  return {
    type: GETSTREAM_DELETE_DRAFT_ATTACHMENT,
    payload: { draftId, attachmentId, path, src },
  }
}

/**
 * Fetches the latest notifications for the user
 */
export function getCommunityNotifications () {
  return {
    type: GETSTREAM_GET_NOTIFICATIONS_REQUEST,
  }
}

/**
 * Sets the latest notifications as "seen" and fetches the latest again
 */
export function setCommunityNotificationsSeen () {
  return {
    type: GETSTREAM_SET_NOTIFICATIONS_SEEN,
  }
}

/**
 * Sets a notification as "read" and fetches the latest again
 * @param {String} notificationId - The unique id for the notification
 */
export function setCommunityNotificationRead (notificationId) {
  return {
    type: GETSTREAM_SET_NOTIFICATION_READ,
    payload: { notificationId },
  }
}
