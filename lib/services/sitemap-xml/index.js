import { get as apiGet, TYPE_BROOKLYN, REQUEST_TYPE_APPLICATION_XML, REQUEST_ACCEPT_APPLICATION_XML } from 'api-client'
import { Map } from 'immutable'

export async function get (options = {}) {
  const { auth = Map(), data } = options
  try {
    return await apiGet('sitemap.xml', data, {
      auth,
      json: false,
      reqType: REQUEST_TYPE_APPLICATION_XML,
      reqAccept: REQUEST_ACCEPT_APPLICATION_XML,
    }, TYPE_BROOKLYN)
  } catch (e) {
    return ''
  }
}

export default {
  get,
}
