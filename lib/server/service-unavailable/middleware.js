import parseInt from 'lodash/parseInt'
import { render as renderMu } from 'mustache'

export default function middleware (config, options) {
  return function route (req, res, next) {
    if (parseInt(config.serviceUnavailable)) {
      const { muPartials } = options
      const html = renderMu('{{> serviceUnavailable }}', {}, muPartials)
      res.status(503)
      res.send(html)
      return
    }
    next()
  }
}
