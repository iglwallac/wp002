
import ImageCompression from 'browser-image-compression'
import { Promise as BluebirdPromise } from 'bluebird'
import toLower from 'lodash/toLower'
import { v4 as uuidv4 } from 'uuid'
import assign from 'lodash/assign'
import reduce from 'lodash/reduce'
import { Map } from 'immutable'
import find from 'lodash/find'
import get from 'lodash/get'
import map from 'lodash/map'
import {
  REQUEST_ACCEPT_APPLICATION_JSON,
  RESPONSE_ERROR_TYPE_RANGE_400,
  TYPE_BROOKLYN,
  post as apiPost,
  get as apiGet,
  del as apiDel,
} from 'api-client'

const COMMUNITY_IMAGE_SIZE = 1350

export const COMMUNITY_PAGE_HERO_TEXT = `
  Thanks for participating in the Gaia Community Beta. 
  We're hard at work building an experience that allows our amazing community to connect and increase global consciousness more directly. 
  This is just the beginning and we look forward to your feedback! 
  Please understand that we are actively developing Community, and things may change, break, or otherwise not work as expected. 
  Please send any feedback to community@gaia.com
`

export const REGEXP_URL = /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi

function getShortyURL (url) {
  const noHttp = (url || '').replace(/^https?:\/\/(www.)?/i, '')
  const shorty = noHttp.slice(0, 15)
  return shorty.length < noHttp.length
    ? `${shorty}...`
    : shorty
}

/**
 * Utility function to create dataURIs for image files
 * @param {File[]} files the files
 */
export async function createDataUri (file) {
  return new BluebirdPromise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = async (fileEvent) => {
      const fileData = fileEvent.target.result
      //
      const imageCompressionData = await ImageCompression.getFilefromDataUrl(fileData)
      const compressedImage =
        await ImageCompression(imageCompressionData, {
          maxWidthOrHeight: COMMUNITY_IMAGE_SIZE,
        })
        //
      const fr = new FileReader()
      fr.onload = (fe) => {
        const compressed = fe.target.result
        const data = compressed.replace(/^.*,/, '')
        const image = Map({
          fileData: compressed,
          filename: file.name,
          id: uuidv4(),
          data,
        })
        resolve(image)
        fr.onerror = (e) => {
          reject(e)
        }
      }
      fr.readAsDataURL(compressedImage)
    }
  })
}

/**
 * Creates an activity
 * @param {Object} options the options
 * @param {Object} options.activity the activity as defined by ./activity
 */
export async function addActivity ({ auth, activity }) {
  const params = {
    responseErrorType: RESPONSE_ERROR_TYPE_RANGE_400,
    reqType: REQUEST_ACCEPT_APPLICATION_JSON,
    auth,
  }
  const response = await apiPost(
    '/v1/community/activity', activity, params, TYPE_BROOKLYN)
  return get(response, 'body', {})
}

/**
 * Gets an activity
 * @param {Object} options the options
 * @param {Object} options.uuid the activity uuid
 * @param {Object} options.auth auth
 */
export async function getActivity ({ auth, uuid }) {
  const response = await apiGet(
    `/v1/community/activities?id=${uuid}&include=tree`, {}, { auth }, TYPE_BROOKLYN)
  return get(response, 'body', {})
}

/**
 * Removes an activity
 * @param {Object} options the options
 * @param {Object} options.activityId the activityId of activity to be removed
 */
export async function removeActivity ({ auth, activityId }) {
  const params = {
    reqType: REQUEST_ACCEPT_APPLICATION_JSON,
    auth,
  }
  const response = await apiDel(
    `/v1/community/activity/${activityId}`, {}, params, TYPE_BROOKLYN)
  return get(response, 'body', {})
}

/**
 * Creates a reaction
 * @param {Object} options the options
 * @param {Object} options.activity the activityUuid
 * @param {Object} options.type the type ie. LIKED
 */
export async function addReaction ({ auth, activity, type }) {
  const params = {
    reqType: REQUEST_ACCEPT_APPLICATION_JSON,
    auth,
  }
  const response = await apiPost(
    '/v1/community/reaction', { activity, type }, params, TYPE_BROOKLYN)
  return get(response, 'body', {})
}

/**
 * Removes a reaction
 * @param {Object} options the options
 * @param {Object} options.activityUuid the activityUuid of activity to be removed
 */
export async function removeReaction ({ auth, activityUuid }) {
  const params = {
    reqType: REQUEST_ACCEPT_APPLICATION_JSON,
    auth,
  }
  const response = await apiDel(
    `/v1/community/reaction/${activityUuid}`, {}, params, TYPE_BROOKLYN)
  return get(response, 'body', {})
}

/**
 * Connect feed
 * @param {Object} options the options
 * @param {Object} options.activity the activity as defined by ./activity
 */
export async function connectFeed ({ auth, id }) {
  const response = await apiGet(
    `/v1/community/feed/${id}/activities`,
    {},
    { auth },
    TYPE_BROOKLYN,
  )
  return get(response, 'body', {})
}

/**
 * Fetches activities
 * @param {Object} options the options
 * @param {Object} options.activity the activity as defined by ./activity
 */
export async function fetchActivities ({ auth, feedId }) { // id FIX THIS TO USE IDS
  const response = await apiGet(
    `/v1/community/feed/${feedId}/activities`, // use id once the endpoint is fixed
    {},
    { auth },
    TYPE_BROOKLYN,
  )
  return get(response, 'body', {})
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
    const end = get(regex, 'lastIndex')
    const body = toLower(get(m, 0))
    const start = get(m, 'index')

    matches.push({
      locations: [{ start, end, body, wrap: true }], // source string locations
      image: {}, // open graph image data { height, width, image, url }
      shorty: getShortyURL(body), // a shorthand url for post rendering
      valid: false, // the url is a legit, renderable web location
      verified: false, // the url has been verified by open graph
      render: true, // should render the open graph object
      source: body, // the original source string
      id: uuidv4(), // random unique identifier
      description: '', // webpage description
      title: '', // webpage document title
      url: '', // webpage url
    })
  }
  return reduce(matches, (out, match) => {
    const existing = find(out, (o) => {
      let oSrc = o.source.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
      oSrc = oSrc.replace(/\/$/, '')
      let matchSrc = match.source.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
      matchSrc = matchSrc.replace(/\/$/, '')
      return oSrc === matchSrc
    })
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
export async function openGraph ({ auth, urls }) {
  const params = {
    responseErrorType: RESPONSE_ERROR_TYPE_RANGE_400,
    reqType: REQUEST_ACCEPT_APPLICATION_JSON,
    auth,
  }
  const url = map(urls, (u) => {
    return get(u, 'source')
  })
  try {
    const response = await apiPost(
      '/v1/community/assets/og', { url }, params, TYPE_BROOKLYN)
    const res = get(response, 'body.result', {})
    const ogs = reduce(urls, (acc, u) => {
      const matchingRes = res.find((r) => {
        return r.requestURL === u.source
      })

      if (matchingRes) {
        const data = assign({}, u, {
          description: get(matchingRes, 'description') || '',
          requestUrl: get(matchingRes, 'requestURL'),
          url: get(matchingRes, 'url') || u.source,
          image: get(matchingRes, 'image') || {},
          title: get(matchingRes, 'title') || '',
          tinyUrl: get(matchingRes, 'tinyURL'),
          charset: get(matchingRes, 'charset'),
          local: get(matchingRes, 'locale'),
          render: get(matchingRes, 'valid'),
          valid: get(matchingRes, 'valid'),
          verified: true,
        })
        acc.push(data)
      }
      return acc
    }, [])
    return ogs
  } catch (_) {
    return map(urls, (u) => {
      return assign({}, u, {
        render: false,
      })
    })
  }
}

/**
 * creates text with a tags
 * @param {Map} activity the activity
 */
export function getTextWithLinks (value, graphs) {
  const text = graphs.reduce((acc, g) => {
    const requestUrl = g.getIn(['data', 'requestUrl'])
    const valid = g.getIn(['data', 'valid'])
    const url = g.getIn(['data', 'url'])
    let baseReqUrl = requestUrl.replace(/(?:https?:\/\/)?(?:www\.)?/gi, '')
    baseReqUrl = baseReqUrl.replace(/\/$/, '')
    const regex = new RegExp(`(?:https?://)?(?:www.)?${baseReqUrl}(/)?`, 'gmi')
    if (requestUrl && url && valid) return acc.replaceAll(regex, match => (`<a href="${url}" target="_blank">${match}</a>`))
    return acc
  }, value)
  return text
}
