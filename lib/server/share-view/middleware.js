import _partial from 'lodash/partial'
import _get from 'lodash/get'

export default function middleware (options) {
  return _partial(route, options)
}

function createShareViewRedirectUrl (url, origin) {
  return `${origin}/${url}?shareView=expired`
}

function route (options, req, res, next) {
  const { origin } = options
  // Find out if the shareView video isExpired
  const isExpired = _get(
    req,
    ['hydrate', 'shareView', 'videoDetails', 'data', 'isExpired'],
    false,
  )
  const url = _get(
    req,
    ['hydrate', 'shareView', 'videoDetails', 'data', 'video', 'url'],
    '',
  )
  const redirectUrl = createShareViewRedirectUrl(url, origin)
  if (isExpired) {
    res.redirect(301, redirectUrl)
    res.end()
    return
  }
  next()
}
