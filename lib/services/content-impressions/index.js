import { post, TYPE_BROOKLYN_JSON } from 'api-client'
import _get from 'lodash/get'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'

const INBOUND_TRACKING_CI_SCHEMA = {
  _dataError: null,
  success: null,
}

/**
 * Set the featured content impression for the user
 * @param {Object} options The options
 * @param {Number} options.contentId The content id
 * @param {String} options.contentType The content type
 * @param {Number} options.timestamp The timestamp for the event
 * @param {Object|import('immutable').Map} options.auth The user auth
 */
export async function setContentImpression (options = {}) {
  const { contentId, contentType, timestamp, auth } = options
  const impression = {
    eventType: 'pre-checkout-impression',
    contentType,
    contentId,
    impressionTimestamp: Math.round(timestamp.getTime() / 1000),
  }
  try {
    const res = await post('v2/user/content-impression', impression, { auth }, TYPE_BROOKLYN_JSON)
    return handleSetContentResponse(res)
  } catch (e) {
    return handleSetContentResponse({}, true)
  }
}

export function createModel (data, _dataError) {
  return _assign(_cloneDeep(INBOUND_TRACKING_CI_SCHEMA), {
    _dataError,
    success: _get(data, 'success', false),
  })
}

export function handleSetContentResponse (res, _dataError) {
  const data = _get(res, 'body', res)
  return createModel(data, _dataError)
}
