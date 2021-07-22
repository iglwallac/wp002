import { getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import {
  hydrateReq,
  getReqAuthUid,
  getUserLocale,
  getReqUserLanguage,
} from 'server/common'
import { isFast404 } from 'services/url'
import { get as getStaticText } from 'services/static-text'

let log

export default function middleware () {
  return async function route (req, res, next) {
    const uid = getReqAuthUid(req)
    const locale = getUserLocale(req)
    const storeBranch = 'detailEpisode'
    const language = getReqUserLanguage(req)

    log = getSetLogger(getLoggerServer(uid))
    log.info('Hydrating WebApp Static Text')
    if (isFast404(req.path)) {
      log.info('Hydrating WebApp Static Text Complete Fast 404')
      next()
      return
    }
    try {
      const data = await getStaticText({ storeBranch, locale, language })
      log.info('Completed Hydrating WebApp Static Text')
      hydrateReq(req, {
        staticText: { data },
      })
    } catch (e) {
      log.error(e, 'Failed Hydrating WebApp Static Text')
    }
    next()
  }
}
