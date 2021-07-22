import { setResNoCache } from 'server/common'
import _partial from 'lodash/partial'

export default function middleware (options) {
  return _partial(route, options || {})
}

function route (options, req, res) {
  setResNoCache(res)
  return res.json({ success: true })
}
