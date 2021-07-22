import _get from 'lodash/get'
import _map from 'lodash/map'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { getMultipleVideos } from 'services/videos/actions'

export async function getMany (dispatch, guideDayIds, options = {}, fetchChildren) {
  const {
    auth,
    language,
  } = options

  // Fetch all data concurrently
  const responses = await Promise.map(guideDayIds, async (guideDayId) => {
    try {
      const data = await get(guideDayId, { auth, language })
      const contentIds = _map(_get(data, 'guideDayVideos', []), 'contentId')
      if (fetchChildren) {
        dispatch(getMultipleVideos(contentIds, language))
      }
      return { guideDayId, data }
    } catch (error) {
      return { guideDayId, error }
    }
  })

  // Return { error } or { data } keyed by guideDayId
  const guide = responses.reduce((acc, response) => {
    if (response.error) {
      acc[response.guideDayId] = { error: response.error }
    } else if (response.data) {
      acc[response.guideDayId] = { data: response.data }
    }
    return acc
  }, {})

  return guide
}

export async function get (guideDayId, options = {}) {
  const {
    language,
  } = options

  const response = await apiGet(`node/${guideDayId}`, { language }, {}, TYPE_BROOKLYN)
  // TODO switch back to content/guide/${guideDayId} once it's fixed
  // const query = { d6Id: true, view: 'node', language }
  // const response = await apiGet(`content/guide/${guideDayId}`, query, { auth }, TYPE_BROOKLYN)

  const body = _get(response, 'body', {})
  if (body.nid < 1) {
    throw new Error(`Bad guide ${guideDayId}, response nid: ${body.nid}`)
  }

  return body
}
