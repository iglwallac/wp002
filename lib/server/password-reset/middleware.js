import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import _includes from 'lodash/includes'
import _partial from 'lodash/partial'
import { setResNoCache, hydrateReq } from 'server/common'

export default function middleware (options) {
  return _partial(route, options)
}

export function route (options, req, res, next) {
  const {
    paths = [],
    log,
  } = options
  if (_includes(paths, req.path)) {
    setResNoCache(res)
    log.info('Hydrating Password Reset')
    hydrateReq(req, {
      resetPassword: {
        uid: _parseInt(_get(req, ['query', 'uid'], -1)),
        expiry: _parseInt(_get(req, ['query', 'expiry'], 0)),
        token: _get(req, ['query', 'token'], null),
      },
    })
    log.info('Hydrating Password Reset Complete')
  }
  next()
}
