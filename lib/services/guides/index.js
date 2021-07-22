import _get from 'lodash/get'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'

export async function getMany (guideIds, options = {}) {
  const {
    auth,
    language,
  } = options

  // Fetch all data concurrently
  const responses = await Promise.map(guideIds, async (guideId) => {
    try {
      const data = await get(guideId, { auth, language })
      return { guideId, data }
    } catch (error) {
      return { guideId, error }
    }
  })

  // Return { error } or { data } keyed by guideId
  const guide = responses.reduce((acc, response) => {
    if (response.error) {
      acc[response.guideId] = { error: response.error }
    } else if (response.data) {
      acc[response.guideId] = { data: response.data }
    }
    return acc
  }, {})

  return guide
}

export async function get (guideId, options = {}) {
  const {
    language,
  } = options

  const response = await apiGet(`node/${guideId}`, { language }, {}, TYPE_BROOKLYN)
  // TODO switch back to content/guide/${guideId} once it's fixed
  // const query = { d6Id: true, view: 'node', language }
  // const response = await apiGet(`content/guide/${guideId}`, query, { auth }, TYPE_BROOKLYN)

  const body = _get(response, 'body', {})
  if (body.nid < 1) {
    throw new Error(`Bad guide ${guideId}, response nid: ${body.nid}`)
  }

  return body
}
