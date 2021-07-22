import _partial from 'lodash/partial'
import _isNumber from 'lodash/isNumber'
import { DISALLOW_ALL_FILE_PATH, ALLOW_ALL_FILE_PATH } from 'robots-txt'
import {
  setResNoCache,
  sendRes503RetryAfter,
  setFinalCacheHeaders,
} from 'server/common'

export default function middleware (options) {
  return _partial(route, options)
}

function route (options, req, res) {
  const { canIndex, maxAge, retryAfter } = options
  const robotsPath = canIndex ? ALLOW_ALL_FILE_PATH : DISALLOW_ALL_FILE_PATH
  if (!_isNumber(maxAge) || maxAge <= 0) {
    setResNoCache(res)
  } else {
    setFinalCacheHeaders(req, res, { public: true, maxAge })
  }
  if (retryAfter) {
    sendRes503RetryAfter(res, retryAfter)
  }
  res.sendFile(robotsPath, { maxAge })
}
