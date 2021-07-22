import _get from 'lodash/get'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { createModel as createTileModel } from 'services/tile'

export async function getMany (seriesIds, options = {}) {
  const {
    auth,
    language,
  } = options

  // Fetch all data concurrently
  const responses = await Promise.map(seriesIds, async (seriesId) => {
    try {
      const data = await get(seriesId, { auth, language })
      return { seriesId, data }
    } catch (error) {
      return { seriesId, error }
    }
  })

  // Return { error } or { data } keyed by seriesId
  const pmSeries = responses.reduce((acc, response) => {
    if (response.error) {
      acc[response.seriesId] = { error: response.error }
    } else if (response.data) {
      acc[response.seriesId] = { data: response.data }
    }
    return acc
  }, {})

  return pmSeries
}

export async function get (seriesId, options = {}) {
  const {
    language,
  } = options

  const response = await apiGet(`node/${seriesId}`, { language }, {}, TYPE_BROOKLYN)
  // TODO switch back to content/series/${seriesId} once it's fixed
  // const query = { d6Id: true, view: 'node', language }
  // const response = await apiGet(`content/series/${seriesId}`, query, { auth }, TYPE_BROOKLYN)
  const body = _get(response, 'body', {})

  if (body.nid < 1) {
    throw new Error(`Bad series ${seriesId}, response nid: ${body.nid}`)
  }

  return createTileModel(body)
}
