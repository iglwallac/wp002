import strictUriEncode from 'strict-uri-encode'

export default function middleware (options) {
  const { name, version } = options
  if (!name) {
    throw new Error(
      'A name option is required for the server information middleware.',
    )
  }
  if (!version) {
    throw new Error(
      'A version option is required for the server information middleware.',
    )
  }
  const headerValue = `${strictUriEncode(name)}/${strictUriEncode(version)}`
  return function route (req, res, next) {
    res.setHeader('Server', headerValue)
    next()
  }
}
