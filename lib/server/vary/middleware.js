export default function middleware () {
  return function route (req, res, next) {
    res.header('Vary', 'Authorization, Cookie')
    next()
  }
}
