import { post as apiPost, TYPE_BROOKLYN } from 'api-client'
import strictUriEncode from 'strict-uri-encode'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'

export const MAX_VOTE = 100
export const MIN_VOTE = 20

const SCHEMA = {
  id: null,
  _dataError: false,
  vote: null,
}

export async function recommend (options) {
  const { id, auth, vote } = options
  try {
    const res = await apiPost(`user/node/${strictUriEncode(id)}/vote`, { vote }, { auth }, TYPE_BROOKLYN)
    return handleRecommendResponse(res, id, vote)
  } catch (e) {
    return handleRecommendResponse({}, id, vote, true)
  }
}

function handleRecommendResponse (res, id, vote, _dataError) {
  return createModel(id, vote, _dataError)
}

function createModel (id, vote, _dataError) {
  return _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    vote,
  })
}
