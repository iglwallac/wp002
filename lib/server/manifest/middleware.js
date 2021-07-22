import _partial from 'lodash/partial'
import _isNumber from 'lodash/isNumber'
import {
  MANIFEST_JSON_FILE_PATH,
  MANIFEST_IMG_192_FILE_PATH,
  MANIFEST_IMG_512_FILE_PATH,
} from 'services/manifest'
import {
  setResNoCache,
  sendRes503RetryAfter,
  setFinalCacheHeaders,
} from 'server/common'

export const TYPE_JSON = 'TYPE_JSON'
export const TYPE_IMG_512 = 'TYPE_IMG_512'
export const TYPE_IMG_192 = 'TYPE_IMG_192'

export default function middleware (options) {
  return _partial(route, options)
}

function route (options, req, res) {
  const { maxAge, retryAfter, type } = options
  if (!_isNumber(maxAge) || maxAge <= 0) {
    setResNoCache(res)
  } else {
    setFinalCacheHeaders(req, res, { public: true, maxAge })
  }
  if (retryAfter) {
    sendRes503RetryAfter(res, retryAfter)
  }
  if (type === TYPE_IMG_192) {
    res.sendFile(MANIFEST_IMG_192_FILE_PATH, { maxAge })
    return
  }
  if (type === TYPE_IMG_512) {
    res.sendFile(MANIFEST_IMG_512_FILE_PATH, { maxAge })
    return
  }
  res.sendFile(MANIFEST_JSON_FILE_PATH, { maxAge })
}
