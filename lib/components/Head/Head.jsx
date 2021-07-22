import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _concat from 'lodash/concat'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _size from 'lodash/size'
import _get from 'lodash/get'
import Helmet from 'react-helmet'
import { RESOLVER_TYPE_NOT_FOUND } from 'services/resolver/types'
import { parse as parseQuery } from 'services/query-string'
import { SEO_ALLOWED_INDEX_QUERY_PARAMS, getPageTitle } from 'services/page'

export const FB_PROPERTY_APP_ID = 'fb:app_id'
export const OG_PROPERTY_SITE_NAME = 'og:site_name'
export const OG_PROPERTY_TITLE = 'og:title'
export const OG_PROPERTY_IMAGE = 'og:image'
export const OG_PROPERTY_URL = 'og:url'
export const OG_PROPERTY_TYPE = 'og:type'
export const OG_PROPERTY_DESCRIPTION = 'og:description'
export const TWITTER_CARD = 'twitter:card'
export const TWITTER_IMAGE = 'twitter:image'
export const TWITTER_TITLE = 'twitter:title'
export const TWITTER_DESCRIPTION = 'twitter:description'

function getLinkPrev (page) {
  const href = page.get('prev')
  if (!href) {
    return []
  }
  return [{ rel: 'prev', href }]
}

function getLinkNext (page) {
  const href = page.get('next')
  if (!href) {
    return []
  }
  return [{ rel: 'next', href }]
}

function getLink (page, location) {
  const link = [
    { rel: 'icon', type: 'img/png', href: '/favicon.ico?ver=0.0.2' },
  ]
  return _concat(
    link,
    getLinkCanonical(page, location),
    getLinkPrev(page),
    getLinkNext(page),
  )
}

function getLinkCanonical (page, location) {
  return [{ rel: 'canonical', href: page.get('canonical', location.pathname) }]
}

function getMeta (page, location, resolver) {
  return _concat(
    getPageMetaDescription(page),
    getPageMetaOg(page),
    getMetaRobots(page, location, resolver),
    getPageMetaTwitter(page),
  )
}

function getMetaRobots (page, location, resolver) {
  const query = parseQuery(location.search)
  const resolverType = resolver.getIn(['data', 'type'])
  const defaultNoIndex = resolverType === RESOLVER_TYPE_NOT_FOUND
  // defaults to true if there is no query params, which is desired
  let seoAllowedQueryParams = _size(query) === 0

  // loop through the query params and see if there is an allowed param
  if (_size(query) > 0) {
    _forEach(query, (value, key) => {
      if (seoAllowedQueryParams) {
        return false
      }
      seoAllowedQueryParams = _find(SEO_ALLOWED_INDEX_QUERY_PARAMS, param => param === key)
      return seoAllowedQueryParams
    })
  }

  const noFollow = page.get('noFollow', false)
  let noIndex = page.get('noIndex', defaultNoIndex)

  // if there is not an allowed query param, do not allow the page to be indexed
  if (!seoAllowedQueryParams) {
    noIndex = true
  }

  const metaRobotsShouldRender = noFollow || noIndex || !seoAllowedQueryParams

  if (!metaRobotsShouldRender) {
    return []
  }

  const robotsContent = []
  // If there is a query string, noindex, follow
  // Otherwise, conditionally push on nofollow, noindex based on props
  if (noFollow) {
    robotsContent.push('nofollow')
  }
  if (noIndex) {
    robotsContent.push('noindex')
  }
  return [{ name: 'robots', content: robotsContent.join(', ') }]
}

function getPageMetaDescription (page) {
  const content = page.get('description')
  if (!content) {
    return []
  }
  return [{ name: 'description', content }]
}

function getPageMetaOg (page) {
  const meta = [
    { property: FB_PROPERTY_APP_ID, content: page.get('facebookAppId') },
    { property: OG_PROPERTY_SITE_NAME, content: page.get('ogSiteName') },
    { property: OG_PROPERTY_TITLE, content: page.get('ogTitle') },
    { property: OG_PROPERTY_IMAGE, content: page.get('ogImage') },
    { property: OG_PROPERTY_URL, content: page.get('ogUrl') },
    { property: OG_PROPERTY_TYPE, content: page.get('ogType') },
    { property: OG_PROPERTY_DESCRIPTION, content: page.get('ogDescription') },
  ]
  return _filter(meta, v => _get(v, 'content'))
}

function getPageMetaTwitter (page) {
  const meta = [
    { name: TWITTER_CARD, content: page.get('twitterCard') },
    { name: TWITTER_IMAGE, content: page.get('twitterImage') },
    { name: TWITTER_TITLE, content: page.get('twitterTitle') },
    { name: TWITTER_DESCRIPTION, content: page.get('twitterDescription') },
  ]
  return _filter(meta, v => _get(v, 'content'))
}

function getClass (isWebView, interstitial, scrollable, jwt) {
  const cls = [jwt ? 'app--member' : 'app--anon']
  // the app--webview class is for styling content
  // specific to a native application WebView
  if (isWebView) cls.push('app--webview')
  if (scrollable === false) cls.push('app--noscroll')
  if (interstitial.get('view')) cls.push('app--interstitial')
  if (interstitial.get('leaving')) cls.push('app--interstitial-leaving')
  return cls.join(' ')
}

function isEmbedded (location) {
  const embed = _get(location, 'query.embed', 'false')
  return embed === 'true'
}

function Head ({
  interstitial,
  contentLang,
  scrollable,
  isWebView,
  resolver,
  location,
  page,
  jwt,
}) {
  const pageTitle = getPageTitle(page)
  const embed = isEmbedded(location)
  // cache htmlAttributes
  const htmlAttributes = useMemo(() => ({
    class: getClass(isWebView, interstitial, scrollable, jwt),
    'data-embed': embed,
    lang: contentLang,
  }), [jwt, embed, scrollable, interstitial, contentLang])
  // cache link
  const link = useMemo(() => (
    getLink(page, location)
  ), [page, location])
  // cache meta
  const meta = useMemo(() => (
    getMeta(page, location, resolver)
  ), [page, location, resolver])

  const getLdJson = (path) => {
    if (!path) {
      return null
    }

    if (path === '/series/initiation') {
      return (
        <script type="application/ld+json">
          {`
            {"@context":"http://schema.org",
            "@type":"TVSeries",
            "url":"https://www.gaia.com/series/initiation",
            "contentRating":"TV-G",
            "name":"Initiation",
            "description":"In this groundbreaking series, Matias De Stefano remembers his connection to the Akashic Records. The information he recalls gives him a unique, and powerful understanding of the creation of the universe and the many dimensions and layers of reality we all exist within.",
            "genre":"Special Interest, Documentary",
            "image":"https://brooklyn.gaia.com/v1/image-render/1f48cff3-f4f9-4b18-95f4-70f270222473/183818_initiation_w_matias-de-stefano_16x9.jpg",
            "dateCreated":"2019-9-30",
            "actors":[{"@type":"Person","name":"Matias De Stefano"}],
            "creator":[{"@type":"Organization","name":"Gaia"}],
            "director":[],
            "numberOfSeasons":3,
            "startDate":"2019-9-30"}
          `}
        </script>
      )
    } else if (path === '/series/deep-space') {
      return (
        <script type="application/ld+json">
          {`
            {"@context":"http://schema.org",
            "@type":"TVSeries",
            "url":"https://www.gaia.com/series/deep-space",
            "contentRating":"TV-G",
            "name":"Deep Space",
            "description":"Deep Space brings together the best minds in their fields to shed new light on extremely controversial subjects that can no longer remain hidden or denied: extraterrestrial beings, suppressed technology & cover-ups.",
            "genre":"Special Interest, Documentary",
            "image":"https://brooklyn.gaia.com/v1/image-render/78e0ceb4-74d7-4eef-bfe0-f8fbd91f0c90/128571_deep-space_16x9.jpg",
            "dateCreated":"2016-8-15",
            "actors":[{"@type":"Person","name":"Regina Meredith"},{"@type":"Person","name":"Billy Carson"}],
            "creator":[{"@type":"Organization","name":"Gaia"}],
            "director":[],
            "numberOfSeasons":2,
            "startDate":"2016-8-15"}
          `}
        </script>
      )
    }

    return null
  }

  return (
    <Helmet
      htmlAttributes={htmlAttributes}
      title={pageTitle}
      link={link}
      meta={meta}
    >
      {getLdJson(resolver.get('path', null))}
    </Helmet>
  )
}

Head.defaultProps = {
  scrollable: true,
  jwt: null,
}

Head.propTypes = {
  interstitial: ImmutablePropTypes.map.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  scrollable: PropTypes.bool,
  jwt: PropTypes.string,
}

export default Head
