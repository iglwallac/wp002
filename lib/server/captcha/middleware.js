import verifyToken from 'services/captcha'
import { setResNoCache } from 'server/common'

/**
 * Middleware to get a signature token from Zuora to render an iframe
 * @param {Object} options The options
 * @returns {Function} An express route handler
 */
export default function middleware (options = {}) {
  const { log } = options

  if (!log) {
    throw new Error('The log option is a required')
  }

  return async function route (req, res) {
    setResNoCache(res)

    try {
      const { body } = req
      const { googleRecaptchaToken } = body

      if (!googleRecaptchaToken) {
        throw new Error('The Google Recaptcha token is required')
      }

      const result = await verifyToken({ token: googleRecaptchaToken, log })

      res.status(200)
      res.json(result)
    } catch (e) {
      res.status(500)
      res.json({ success: false, message: e.message })
    }
  }
}
