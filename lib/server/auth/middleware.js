import _get from 'lodash/get'
import _set from 'lodash/set'
import _parseInt from 'lodash/parseInt'
import _omit from 'lodash/omit'
import { hydrateReq } from 'server/common'
import { getLogger, getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import { getRoles as getAuthRoles } from 'services/auth-access'
import { renew, createAuthCookieStorage, AUTH_COOKIE_NAME } from 'services/auth'

export default function middleware () {
  return async function route (req, res, next) {
    let log = getLogger()
    const authCookie = _get(req, ['cookies', AUTH_COOKIE_NAME])
    if (authCookie) {
      log.info('Hydrating Auth From Cookies')
      try {
        let auth = JSON.parse(authCookie)
        const uid = _parseInt(_get(auth, 'uid', -1))
        if (uid > -1) {
          log = getSetLogger(getLoggerServer(uid))
          // Check if auth is expired or expiring in the next 5 minutes
          const nowSeconds = Math.floor(Date.now() / 1000) - 300
          // Renew auth if expired
          if (_get(auth, 'idExpires') <= nowSeconds) {
            log.info(`Auth Renewing For User ${uid}`)
            const data = await renew({ auth })
            if (_get(data, 'auth.success')) {
              auth = _get(data, 'auth')
              const {
                value,
                expires,
                path,
                secure,
              } = createAuthCookieStorage(auth)
              _set(req, ['cookies', AUTH_COOKIE_NAME], value)
              res.cookie(AUTH_COOKIE_NAME, value, { path, secure, expires })
              log.info(`Completed Auth Renewing For User ${uid}`)
            }
          }
          auth.roles = getAuthRoles(auth)
          hydrateReq(req, { auth })
          log.info(`Completed Hydrating Auth For User ${uid}`)
        } else {
          log.warn('Failed Hydrating Auth', _omit(auth, ['jwt']))
          // Remove the cookie it is not valid so destory it.
          res.clearCookie(AUTH_COOKIE_NAME)
          res.status(400)
        }
      } catch (e) {
        log.error('Failed Hydrating Auth From Cookies', e)
        res.status(400)
      }
    }
    next()
  }
}
