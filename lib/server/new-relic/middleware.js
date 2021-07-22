import _get from 'lodash/get'
import {
  getPathname,
  getReqAuthToken,
  getReqAuthUid,
} from 'server/common'
import { setTransaction } from 'new-relic-transaction'

/**
 * Express middleware that sets transaction information dynmically
 * @returns {Function} An express route handler
 */
export default function middleware () {
  /**
   * Express route handler
   * @param {Object} req An Express request object
   * @param {Object} res An Express response object
   * @param {Function} next An express next callback function
   */
  return function route (req, res, next) {
    setTransaction({
      query: _get(req, 'query', {}),
      pathname: getPathname(req),
      authToken: getReqAuthToken(req),
      uid: getReqAuthUid(req),
      username: _get(req, ['hydrate', 'auth', 'username']),
    })
    next()
  }
}
