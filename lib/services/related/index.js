import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _map from 'lodash/map'
import { createModel as createTileModel } from 'services/tile'

export const DEFAULT_LIMIT = 16

const SCHEMA = {
  id: null,
  uid: null,
  _dataError: null,
  processing: false,
  titles: [],
}

export async function get (options) {
  const {
    id,
    uid,
    auth,
    xff,
    limit = DEFAULT_LIMIT,
    page = 0,
    language,
    country,
  } = options
  try {
    const res = await apiGet(
      `v2/videos/${id}/related`,
      { p: page, pp: limit, language, country },
      { auth, xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleRelatedResponse(res, id, uid)
  } catch (e) {
    return handleRelatedResponse({}, id, uid, true)
  }
}

function handleRelatedResponse (res, id, uid, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, id, uid, _dataError)
}

function createModel (data, id, uid, _dataError) {
  const titles = _map(_get(data, 'titles', []), tile => createTileModel(tile))
  return _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    uid,
    titles,
  })
}
