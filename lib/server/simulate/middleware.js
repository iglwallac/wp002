import _get from 'lodash/get'
import { getLogger } from 'log'
import { AUTH_COOKIE_NAME } from 'services/auth'

export default function middleware () {
  const log = getLogger()
  return function route (req, res, next) {
    const { body = {} } = req
    const { value } = body
    if (!value) {
      log.error('Failed simulation no auth value specified.')
      res.status(400)
      next()
      return
    }

    const currentCookie = _get(req, ['cookies', 'auth'])

    if (currentCookie) {
      res.clearCookie(AUTH_COOKIE_NAME)
    }
    res.cookie(AUTH_COOKIE_NAME, value, {
      path: '/',
      secure: !(!process.env.NODE_ENV || process.env.NODE_ENV === 'local'),
    })
    res.redirect(301, '/')
  }
}
