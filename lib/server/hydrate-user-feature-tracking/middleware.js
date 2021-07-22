import _get from 'lodash/get'
import _set from 'lodash/set'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import { getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import {
  hydrateReq,
  getReqAuthUid,
  getReqAuthToken,
  setResNoCache,
} from 'server/common'
import { isFast404 } from 'services/url'
import { get as getFeatureTracking } from 'services/feature-tracking'
import { get as getUser } from 'services/user'
import { getUserPortalMetaData } from 'services/portal'
import { stringify as stringifyQuery } from 'services/query-string'
import { EN } from 'services/languages/constants'
import { join as joinPromise } from 'bluebird'

let log

export default function middleware () {
  return async function route (req, res, next) {
    const uid = getReqAuthUid(req)
    const auth = getReqAuthToken(req)

    log = getSetLogger(getLoggerServer(uid))
    log.info('Hydrating User and Feature Tracking')

    const reqLanguage = getLanguageFromReq(req)

    if (!auth) {
      log.info('Hydrating User and Feature Tracking Anonymous User Language')
      finishPublicHydration(req, next, {})
      return
    }

    // If we are authenticated and have a language parameter remove it from the URL.
    if (reqLanguage) {
      log.info(
        'Hydrating User and Feature Tracking Redirect to Remove Language Query',
      )
      setResNoCache(res)
      res.redirect(302, createReqRedirectUrlWithoutLanguage(req))
      return
    }

    if (isFast404(req.path)) {
      log.info('Hydrating User and Feature Tracking Complete Fast 404')
      next()
      return
    }
    try {
      const [
        featureTrackingResult,
        userResult,
        portalResult,
      ] = await joinPromise(
        getFeatureTracking({ auth }),
        getUser({ auth }),
        getUserPortalMetaData({ auth }),
      )
      const featureTracking = {
        data: featureTrackingResult.toJS(),
      }
      const user = {
        data: userResult,
      }
      const portal = portalResult
      hydrateReq(req, { featureTracking })

      const userFtLanguages = _get(featureTracking, ['data', 'userLanguages'])
      // The user's language is taken first
      if (userFtLanguages) {
        _set(user, ['data', 'language'], userFtLanguages)
      } else {
        const userLanguage = reqLanguage || [EN]
        _set(user, ['data', 'language'], userLanguage)
      }
      if (portal) {
        _set(user, ['data', 'portal'], portal)
      }
      hydrateReq(req, { user })
      log.info('Completed Hydrating User and Feature Tracking')
    } catch (e) {
      log.error(e, 'Failed Hydrating User and Feature Tracking')
    }
    next()
  }
}

function finishPublicHydration (req, next) {
  const reqLanguage = getLanguageFromReq(req)
  const userLanguage = reqLanguage || [EN]
  const user = {
    data: {
      language: userLanguage,
    },
  }
  const featureTracking = {
    data: { userLanguages: userLanguage },
  }
  hydrateReq(req, { user })
  hydrateReq(req, { featureTracking })
  log.info('Hydrating User and Feature Tracking Anonymous User Complete')
  next()
}

export function createReqRedirectUrlWithoutLanguage (req) {
  const redirectQuery = _omit(_get(req, 'query'), ['language'])
  const redirectUrl = _get(req, 'path', '/')
  if (_isEmpty(redirectQuery)) {
    return redirectUrl
  }
  return `${redirectUrl}?${stringifyQuery(redirectQuery)}`
}

/**
 * Get the language value from the request, right now just the query string.
 * This will return an array of english by default
 */
export function getLanguageFromReq (req) {
  const language = _get(req, ['query', 'language'])
  if (language && !_isArray(language)) {
    return [language]
  }
  return language
}
