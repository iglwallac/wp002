/**
 * Error Handler middleware
 * @module error-handler/middleware
 */
import { setResNoCache } from 'server/common'

/**
 * Middleware to handle errors
 * @returns {Funtion} An express route handler
 */
export default function middleware () {
  // eslint-disable-next-line no-unused-vars
  return function route (err, req, res, next) {
    setResNoCache(res)
    res.status(500)
    res.json({ code: err.code, message: err.message })
  }
}
