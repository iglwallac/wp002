import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import strictUriEncode from 'strict-uri-encode'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'

const SCHEMA = {
  id: null,
  _dataError: null,
  featurePosition: 0,
  playlist: false,
}

export async function get (options) {
  const { id, auth } = options
  try {
    const res = await apiGet(`user/node/${strictUriEncode(id)}`, null, { auth }, TYPE_BROOKLYN)
    return handleResponse(res, id)
  } catch (e) {
    return handleResponse({}, id, true)
  }
}

export function handleResponse (res, id, _dataError) {
  const data = _get(res, 'body', {})
  // This is a bool so be careful.
  const featurePosition = _get(data, 'featurePosition', 0)
  return _assign(_cloneDeep(SCHEMA), _get(data, 'mediaUrls', {}), {
    id,
    _dataError,
    featurePosition: featurePosition ? _parseInt(featurePosition) : 0,
    playlist: _get(data, 'playlist', false),
  })
}
