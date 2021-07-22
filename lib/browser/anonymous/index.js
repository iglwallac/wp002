import get from 'lodash/get'
import { get as apiGet, TYPE_WEB_APP } from 'api-client'

function getVisibility () {
  const ret = {}
  if (typeof document.hidden !== 'undefined') {
    ret.type = 'visibilitychange'
    ret.prop = 'hidden'
  } else if (typeof document.msHidden !== 'undefined') {
    ret.type = 'msvisibilitychange'
    ret.prop = 'msHidden'
  } else if (typeof document.webkitHidden !== 'undefined') {
    ret.type = 'webkitvisibilitychange'
    ret.prop = 'webkitHidden'
  }
  return ret
}

export async function getAnonymousUuid () {
  try {
    const auth = window.name || ''
    const options = auth ? { auth } : {}
    const result = await apiGet('/v1/anonymous', null, options, TYPE_WEB_APP)
    const token = get(result, 'body.token', null)
    const uuid = get(result, 'body.uuid', null)
    window.name = token
    return uuid
  } catch (_) {
    return null
  }
}

export function refreshUuidOnRefocus (fn) {
  const { prop, type } = getVisibility()
  if (type && window.addEventListener) {
    window.addEventListener(type, async () => {
      if (!document[prop]) {
        const uuid = await getAnonymousUuid()
        fn(uuid)
      }
    }, false)
  }
}
