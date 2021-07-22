import _get from 'lodash/get'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { createModel as createTileModel } from 'services/tile'

export async function getMany (videoIds, options = {}) {
  const {
    auth,
    language,
  } = options

  // Fetch all data concurrently
  const responses = await Promise.map(videoIds, async (videoId) => {
    try {
      const data = await get(videoId, { auth, language })
      return { videoId, data }
    } catch (error) {
      return { videoId, error }
    }
  })

  // Return { error } or { data } keyed by videoId
  const pmVideos = responses.reduce((acc, response) => {
    if (response.error) {
      acc[response.videoId] = { error: response.error }
    } else if (response.data) {
      acc[response.videoId] = { data: response.data }
    }
    return acc
  }, {})

  return pmVideos
}

export async function get (videoId, options = {}) {
  const {
    language,
  } = options

  const response = await apiGet(`node/${videoId}`, { language }, {}, TYPE_BROOKLYN)
  // TODO switch back to content/videos/${videoId} once it's fixed
  // const query = { d6Id: true, view: 'node', language }
  // const response = await apiGet(`content/videos/${videoId}`, query, { auth }, TYPE_BROOKLYN)
  const body = _get(response, 'body', {})

  if (body.nid < 1) {
    throw new Error(`Bad video ${videoId}, response nid: ${body.nid}`)
  }

  return createTileModel(body)
}
