import _partial from 'lodash/partial'
import _isNumber from 'lodash/isNumber'
import { APPLE_APP_SITE_ASSOCIATION_FILE_PATH } from 'ios-password-autofill'
import {
  setResNoCache,
  sendRes503RetryAfter,
  setFinalCacheHeaders,
} from 'server/common'

export default function middleware (options) {
  return _partial(route, options)
}

function route (options, req, res) {
  const { maxAge, retryAfter } = options
  if (!_isNumber(maxAge) || maxAge <= 0) {
    setResNoCache(res)
  } else {
    setFinalCacheHeaders(req, res, { public: true, maxAge })
  }
  if (retryAfter) {
    sendRes503RetryAfter(res, retryAfter)
  }
  res.sendFile(APPLE_APP_SITE_ASSOCIATION_FILE_PATH, { maxAge })
}
