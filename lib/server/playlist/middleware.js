import _includes from 'lodash/includes'
import _partial from 'lodash/partial'
import { getReqAuthToken, setFinalCacheHeaders } from 'server/common'

export default function middleware (options = {}) {
  return _partial(route, options)
}

export function route (options, req, res, next) {
  const token = getReqAuthToken(req)
  const {
    paths = [],
  } = options
  if (_includes(paths, req.path)) {
    if (!token) {
      setFinalCacheHeaders(req, res, { maxAge: 0 })
      res.status(403)
    }
  }
  next()
}
