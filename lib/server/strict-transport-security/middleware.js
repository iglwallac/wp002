import { partial as _partial } from 'lodash'
import { isReqForwardedProtoHttps } from 'server/common'
import { getSTS } from 'strict-transport-security'

export default function middleware (options) {
  return _partial(route, options)
}

function route (options, req, res, next) {
  // HSTS should only be attached to HTTPS requests
  if (isReqForwardedProtoHttps(req)) {
    return getSTS(options)(req, res, next)
  }
  return next()
}
