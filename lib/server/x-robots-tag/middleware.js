import _size from 'lodash/size'
import _gt from 'lodash/gt'

export default function middleware (options) {
  return function route (req, res, next) {
    const { noindex, nofollow } = options
    const headerVals = []
    if (noindex) {
      headerVals.push('noindex')
    }
    if (nofollow) {
      headerVals.push('nofollow')
    }
    if (_gt(_size(headerVals), 0)) {
      res.setHeader('X-Robots-Tag', headerVals.join(', '))
    }
    next()
  }
}
