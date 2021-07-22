import { getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import {
  hydrateReq,
  getReqAuthUid,
  getUserLocale,
  getReqUserLanguage,
} from 'server/common'
import { isFast404 } from 'services/url'
import { get as getMenu } from 'services/menu'

let log

export default function middleware () {
  return async function route (req, res, next) {
    const uid = getReqAuthUid(req)
    const locale = getUserLocale(req)
    const language = getReqUserLanguage(req)
    log = getSetLogger(getLoggerServer(uid))
    log.info('Hydrating Menu')

    if (isFast404(req.path)) {
      log.info('Hydrating Menu Complete Fast 404')
      next()
      return
    }
    try {
      const menu = await getMenu({ locale, language, uid })
      log.info('Completed Hydrating Menu')
      hydrateReq(req, { menu })
    } catch (e) {
      log.error(e, 'Failed Hydrating Menu')
    }
    next()
  }
}
