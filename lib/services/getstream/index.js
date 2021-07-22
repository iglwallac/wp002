import { TYPE_BROOKLYN_JSON, post as apiPost, get as apiGet } from 'api-client'
import { connect as connectClient } from 'getstream'
import { map as bluebirdMap } from 'bluebird'
import { v4 as uuidv4 } from 'uuid'
import toLower from 'lodash/toLower'
import assign from 'lodash/assign'
import reduce from 'lodash/reduce'
import find from 'lodash/find'
import { getLogger } from 'log'
import _get from 'lodash/get'
import map from 'lodash/map'

export const FEED_TYPES = {
  MAIN: 'MAIN',
}

export const REGEXP_URL = /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi

// temp place for this until we can figure out where to pull this data from...
// this variable needs to be used by both the CommunityFeedPage AND
// set in the store via setJumbotronData() so that the 'view more' can work properly.
export const COMMUNITY_PAGE_HERO_TEXT = `
  Thanks for participating in the Gaia Community Beta. 
  We're hard at work building an experience that allows our amazing community to connect and increase global consciousness more directly. 
  This is just the beginning and we look forward to your feedback! 
  Please understand that we are actively developing Community, and things may change, break, or otherwise not work as expected. 
  Please send any feedback to community@gaia.com
`

/**
 * Logs an error to new relic (or console for local)
 * @param {Error} error the error
 */
function logError (error) {
  const log = getLogger() || console
  log.error(error)
}

function getShortyURL (url) {
  const noHttp = (url || '').replace(/^https?:\/\/(www.)?/i, '')
  const shorty = noHttp.slice(0, 15)
  return shorty.length < noHttp.length
    ? `${shorty}...`
    : shorty
}

function transform (res) {
  const status = _get(res, 'status')
  const body = _get(res, 'body', {})
  const forbidden = status === 403
  const error = status !== 200
    && status !== 201
    && status !== 403
  return assign({}, body, {
    forbidden,
    error,
  })
}

/**
 * creates a Getstream client to communicate with the Getstream API
 * @param {Object} options the options
 * @param {String} options.token the auth token
 * @param {String} options.appId the application id
 * @param {String} options.apiKey the api key
 */
export function getClient (options) {
  const id = _get(options, 'appId')
  const key = _get(options, 'apiKey')
  const token = _get(options, 'token')

  if (!id || !key || !token) {
    const error = new Error(`
      Access Denied. Could not create client.
    `)
    // fake an api response for catch data transform
    error.status = 403
    throw error
  }
  return connectClient(key, token, id)
}

/**
 * parses a text blob for url strings
 * @param {String} blob the text blob
 */
export function parseURLs (blob) {
  const regex = new RegExp(REGEXP_URL)
  const matches = []

  let m
  // eslint-disable-next-line no-cond-assign
  while ((m = regex.exec(blob))) {
    const end = _get(regex, 'lastIndex')
    const body = toLower(_get(m, 0))
    const start = _get(m, 'index')

    matches.push({
      locations: [{ start, end, body, wrap: true }], // source string locations
      shorty: getShortyURL(body), // a shorthand url for post rendering
      description: '', // webpage description
      verified: false, // the url has been verified by open graph
      valid: false, // the url is a legit, renderable web location
      render: true, // should render the open graph object
      id: uuidv4(), // random unique identifier
      title: '', // webpage document title
      url: '', // webpage url
      source: body, // the original source string
      image: {}, // open graph image data { height, width, image, url }
    })
  }
  return reduce(matches, (out, match) => {
    const existing = find(out, o => (
      o.source === match.source
    ))
    if (existing) {
      existing.locations =
        existing.locations.concat(
          match.locations)
    } else {
      out.push(match)
    }
    return out
  }, [])
}

/**
 * creates Open Graph objects from urls
 * @param {String} blob the text blob
 */
export async function openGraph (options) {
  const urls = [].concat(options.urls)
  const client = getClient(options)
  return bluebirdMap(urls, async (url) => {
    try {
      const source = _get(url, 'source')
      const res = await client.og(source)
      const resURL = _get(res, 'url') || source
      const title = _get(res, 'title') || resURL
      return assign({}, url, {
        description: _get(res, 'description') || '',
        image: _get(res, 'images.0') || {},
        verified: true,
        valid: true,
        url: resURL,
        title,
      })
    } catch (_) {
      return assign({}, url, {
        verified: true,
        render: false,
        valid: false,
      })
    }
  })
}

/**
 * Gets a users session and data
 * @param {String} auth The gaia jwt
 * @return {{expires: Date, appId: String, apiKey: String, userId: String, id: String}}
 */
export async function createSession (auth) {
  try {
    const res = await apiPost(
      '/v1/getstream-io/auth', null, { auth }, TYPE_BROOKLYN_JSON)
    return transform(res)
  } catch (e) {
    logError(e)
    return transform(e)
  }
}

/**
 * Gets feed information
 * TODO: Later when we have more feeds we will extend this function
 * with a 'type' property of MAIN, USER, or CONTENT for reusability.
 * @param {Object} options The options
 * @param {String} [options.auth] The gaia jwt
 * @return {{userId: String, id: String, slug: String, feedUrl: String, feedTogether: String}}
 */
export async function getFeed (options) {
  try {
    const auth = _get(options, 'auth')
    const type = _get(options, 'type')

    if (type !== FEED_TYPES.MAIN) {
      throw new Error(`
        Getstream FEED_TYPES_MAIN is only supported.
      `)
    }
    const res = await apiGet('/v1/getstream-io/feed/main',
      null, { auth }, TYPE_BROOKLYN_JSON)
    return transform(res)
  } catch (e) {
    logError(e)
    return transform(e)
  }
}

/**
 * gets reactions for a given activity
 * @param {Object} options the options
 * @param {String} options.activityId the activities unique id
 * @param {String} options.kind The kind of reaction
 * @param {String} options.token the users token
 * @param {String} options.appId the client application id
 * @param {String} options.apiKey the client application key
 */
export async function getActivityReactionsRequest (options) {
  try {
    const kind = _get(options, 'kind')
    const token = _get(options, 'token')
    const appId = _get(options, 'appId')
    const apiKey = _get(options, 'apiKey')
    const activityId = _get(options, 'activityId')
    const client = getClient({ apiKey, appId, token })
    const response = await client.reactions.filter({
      with_activity_data: true,
      activity_id: activityId,
      limit: 25,
      own: true,
      kind,
    })
    return response
  } catch (e) {
    logError(e)
    return {
      message: e.message,
      error: true,
    }
  }
}

/**
 * Toggles a reaction
 * @param {Object} options the options
 * @param {Object} options.reaction a getstream reaction
 * @param {String} options.kind The kind of reaction
 * @param {String} options.token the users token
 * @param {String} options.userId the getstream userId
 * @param {String} options.appId the client application id
 * @param {String} options.apiKey the client application key
 */
export async function toggleChildReactionRequest (options = {}) {
  try {
    const kind = _get(options, 'kind')
    const userId = _get(options, 'userId')
    const reaction = _get(options, 'reaction')
    const client = getClient(options)
    // Relying on latest children seems risky, but requires better getstream reaction
    // return data before we can change this...
    const latestChildren = reaction.latest_children // eslint-disable-line camelcase

    // If there are reactions existing that match the one toggled,
    // find if the same user already created this type of reaction
    if (latestChildren && latestChildren[kind]) {
      const userReaction = find(latestChildren[kind], (child) => {
        return child.user_id === userId
      })
      if (userReaction) {
        await client.reactions.delete(userReaction.id)
      } else {
        await client.reactions.addChild(kind, reaction.id, {}, {
          targetFeeds: [`notification:${reaction.user_id}`],
          userId,
        })
      }
    } else {
      await client.reactions.addChild(kind, reaction.id, {}, {
        targetFeeds: [`notification:${reaction.user_id}`],
        userId,
      })
    }

    return getActivityReactionsRequest({
      ...options,
      activityId: reaction.activity_id,
      kind: 'comment',
    })
  } catch (e) {
    logError(e)
    return {
      message: e.message,
      error: true,
    }
  }
}

/**
 * Utility function to shape file structure
 * @param {File[]} files the files
 */
export function prepFiles (files) {
  return map(files, file => ({
    type: file.type,
    name: file.name,
    id: uuidv4(),
    file,
  }))
}

/**
 * Uploads files for an activity
 * @param {Object} options the options
 * @param {Object[]} options.files an array of files from prepFiles
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function uploadFiles (options) {
  const { files } = options
  if (files && files.length > 0) {
    const client = getClient(options)
    return bluebirdMap(files, async (f) => {
      const { file, id } = f
      try {
        const upload = await client
          .images.upload(file)
        return { id, src: upload.file }
      } catch (e) {
        return { id, error: e.message }
      }
    })
  }
  return []
}

/**
 * Removes uploaded files for an activity
 * @param {Object} options the options
 * @param {Object[]} options.files an array of files from prepFiles
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function removeFiles (options) {
  const { files } = options
  if (files && files.length > 0) {
    const client = getClient(options)
    return bluebirdMap(files, async (file) => {
      await client.images.delete(file.file)
    })
  }
  return []
}

/**
 * fetches an existing activity
 * @param {Object} options the options
 * @param {String} options.activityId the activity id
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function getActivity (options) {
  try {
    const client = getClient(options)
    const data = await client.getActivities({
      ids: [options.activityId],
      withReactionCounts: true,
      withOwnReactions: true,
    })
    return _get(data, 'results.0', {})
  } catch (e) {
    logError(e)
    return transform(e)
  }
}

/**
 * Creates an activity
 * @param {Object} options the options
 * @param {String} options.feedId the feeds id
 * @param {String} options.feedGroup the feeds group
 * @param {Object} options.activity the activity as defined by ./activity
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function addActivity (options) {
  const { feedGroup, activity, feedId, apiKey, token, appId } = options
  const client = getClient({ apiKey, token, appId })
  return client.feed(feedGroup, feedId)
    .addActivity(activity)
}

/**
 * creates a reaction
 * @param {Object} options the options
 * @param {String} options.feedId the feeds id
 * @param {String} options.feedGroup the feeds group
 * @param {Object} options.activityId the activity id
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function addReaction (options) {
  const { reaction, apiKey, token, appId } = options
  const client = getClient({ apiKey, token, appId })
  const kind = reaction.kind
  const activityId = reaction.activityId
  const data = reaction.data
  const targetFeeds = reaction.targetFeeds
  return client.reactions.add(kind, activityId, data, { targetFeeds })
}

/**
 * removes an activity
 * @param {Object} options the options
 * @param {String} options.feedId the feeds id (usersId)
 * @param {String} options.feedGroup the feeds group (user)
 * @param {Object} options.activity the activity as defined by ./activity
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function removeActivity (options) {
  const { feedGroup, activityId, feedId } = options
  const client = getClient(options)
  return client.feed(feedGroup, feedId)
    .removeActivity(activityId)
}

/**
 * removes a reaction
 * @param {Object} options the options
 * @param {Object} options.userReaction the userReaction to delete
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function removeReaction (options) {
  const { userReaction } = options
  const client = getClient(options)
  return client.reactions.delete(userReaction.id)
}

/**
 * Gets notifications for a user
 * @param {Object} options the options
 * @param {Object} options.auth the gaia user auth object
 */
export async function getNotifications (options) {
  const { auth } = options
  try {
    const res = await apiGet('/v1/getstream-io/user/notifications',
      null, { auth }, TYPE_BROOKLYN_JSON)
    return transform(res)
  } catch (e) {
    logError(e)
    return transform(e)
  }
}

/**
 * Registers a notification as seen in getstream db
 * @param {Object} options the options
 * @param {String} options.feedId the getstream user id aka feed id
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 */
export async function setNotificationsSeen (options) {
  const { feedId } = options
  const client = getClient(options)
  // Getstream uses this GET request to mark notifications as seen
  // Not sure why, but this is the way they have provided
  return client.feed('notification', feedId)
    .get({ limit: 10, mark_seen: true })
}

/**
 * Registers a notification as read in getstream db
 * @param {Object} options the options
 * @param {String} options.feedId the getstream user id aka feed id
 * @param {String} options.appId the client application appId
 * @param {String} options.apiKey the client application apiKey
 * @param {String} options.token the user token
 * @param {String} options.notificationId the id of notification
 */
export async function setNotificationRead (options) {
  const { feedId, notificationId } = options
  const client = getClient(options)
  // Getstream uses this GET request to mark notifications as read
  // Not sure why, but this is the way they have provided
  return client.feed('notification', feedId)
    .get({ limit: 10, mark_read: notificationId })
}
