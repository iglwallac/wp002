import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'
import { Map } from 'immutable'

export async function getUserScore (options = {}) {
  const { auth = Map(), nids } = options
  try {
    const res = await apiGet('user/score', { nids }, { auth }, TYPE_BROOKLYN_JSON)
    return res
  } catch (e) {
    return {}
  }
}

export default {
  getUserScore,
}
