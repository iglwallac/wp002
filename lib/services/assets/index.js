import _get from 'lodash/get'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'

export async function getMany (params, options = {}) {
  const {
    language,
  } = options

  const response = await apiGet('/v1/assets/list', { language, ...params }, { languageShouldBeString: true }, TYPE_BROOKLYN)

  const body = _get(response, 'body', {})
  if (body.nid < 1) {
    throw new Error(`Bad guide ${params.contentId}, response nid: ${body.nid}`)
  }

  return body
}

export async function get (assetId, options = {}) {
  const {
    language,
  } = options

  const response = await apiGet(`/v1/assets/${assetId}`, { language }, {}, TYPE_BROOKLYN)
  // TODO switch back to content/guide/${guideDayId} once it's fixed
  // const query = { d6Id: true, view: 'node', language }
  // const response = await apiGet(`content/guide/${guideDayId}`, query, { auth }, TYPE_BROOKLYN)

  const body = _get(response, 'body', {})
  if (body.nid < 1) {
    throw new Error(`Bad guide ${assetId}, response nid: ${body.nid}`)
  }

  return body
}
