import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parse as parseUrl, format as formatUrl } from 'url'
import { parse as parseQuery, stringify as stringifyQuery } from 'services/query-string'
import {
  getOriginDomain,
  createRedirectUrl,
  getOrigin,
  upgradeToHttps,
  changeHostname,
  changeToResolverPath,
  changeUrlFormat,
  stripPathnameTrailingSlashes,
  addPathnameTrailingSlash,
  shouldFormatUrl,
} from './middleware'

const TLD = 'gaia.com'
const SUB_DOMAIN = 'sub.www.gaia.com'
const DOMAIN = 'www.gaia.com'
const ORIGIN = `https://${DOMAIN}`

describe('server middleware redirect', () => {
  describe('Function getOriginDomain()', () => {
    it('returns the origin domain', () => {
      assert.equal(getOriginDomain(ORIGIN), DOMAIN)
    })
  })

  describe('Function getOrigin()', () => {
    it('returns the origin', () => {
      assert.equal(getOrigin(`${ORIGIN}/`), ORIGIN)
    })
  })

  describe('Function createRedirectUrl()', () => {
    it('create redirect urls', () => {
      assert.equal(createRedirectUrl(ORIGIN, ORIGIN), ORIGIN)
      assert.equal(
        createRedirectUrl('/some-path', ORIGIN),
        `${ORIGIN}/some-path`,
      )
      assert.equal(
        createRedirectUrl('/some-path?test=1', ORIGIN),
        `${ORIGIN}/some-path?test=1`,
      )
      assert.equal(
        createRedirectUrl('/some-path?test=1&domain=www.gaia.com', ORIGIN),
        `${ORIGIN}/some-path?test=1&domain=www.gaia.com`,
      )
    })
    it('should add a forward slash to a landing page url', () => {
      assert.equal(createRedirectUrl('/lp/about', ORIGIN, { persistTrailingSlash: true }), `${ORIGIN}/lp/about/`)
    })
    it('should add a forward slash to a landing page url with a query string', () => {
      assert.equal(createRedirectUrl('/lp/about?test=1', ORIGIN, { persistTrailingSlash: true }), `${ORIGIN}/lp/about/?test=1`)
    })
    it('should keeps the URL the same', () => {
      assert.equal(createRedirectUrl('/lp/about/?test=1', ORIGIN, { persistTrailingSlash: true }), `${ORIGIN}/lp/about/?test=1`)
    })
    it('should add a slash if the URL is empty', () => {
      assert.equal(createRedirectUrl('', ORIGIN, { persistTrailingSlash: true }), `${ORIGIN}/`)
    })
    it('should not change the URL when it is /', () => {
      assert.equal(createRedirectUrl('/', ORIGIN, { persistTrailingSlash: true }), `${ORIGIN}/`)
    })
    it('ensures url path is lowercase', () => {
      assert.equal(createRedirectUrl('/fiLMs-dOCS/fILms', ORIGIN),
        `${ORIGIN}/films-docs/films`,
      )
      assert.equal(createRedirectUrl('/Films-docs/Films', ORIGIN),
        `${ORIGIN}/films-docs/films`,
      )
      assert.equal(
        createRedirectUrl('/Films-Docs/Films?CaseSensitiveQuery', ORIGIN),
        `${ORIGIN}/films-docs/films?CaseSensitiveQuery`,
        'Query string character case should remain unchanged',
      )
    })
    it('ensures trailing slashes are stripped from paths', () => {
      assert.equal(createRedirectUrl('/', ORIGIN),
        `${ORIGIN}/`,
        'Should leave one slash at end of root domain',
      )
      assert.equal(createRedirectUrl('//', ORIGIN),
        `${ORIGIN}/`,
        'Should strip extra slashes',
      )
    })
    it('does not alter affiliate urls', () => {
      const affiliateUrl = 'http://Click.LinkSynergy.com/FS-BIN/click?id=hs1e0O6hYd0&offerid=418693.10002017&type=3&subid=0'
      const parsedAffiliateUrl = parseUrl(affiliateUrl)
      const affiliateQuery = parseQuery(parsedAffiliateUrl.search)
      const formattedAffiliateUrl = formatUrl(
        {
          protocol: parsedAffiliateUrl.protocol,
          host: parsedAffiliateUrl.host,
          pathname: parsedAffiliateUrl.pathname,
          search: stringifyQuery(affiliateQuery),
        },
      )
      const redirectUrl = createRedirectUrl(affiliateUrl)

      assert.equal(
        formattedAffiliateUrl,
        redirectUrl,
      )
    })
    it('make sure original url query string is gets passed on to the redirect url', () => {
      const origin = 'www.gaia.com'
      const originalUrl = 'https://www.gaia.com/yoga?utm_source=email'
      const redirectUrl = 'https://www.google.com/account'
      const expectedRedirectUrl = 'https://www.google.com/account?utm_source=email'
      const formattedRedirectUrl = createRedirectUrl(redirectUrl, origin, { originalUrl })

      assert.equal(
        formattedRedirectUrl,
        expectedRedirectUrl,
      )
    })
    it('make sure original url query string and redirect query string get passed on', () => {
      const origin = 'www.gaia.com'
      const originalUrl = 'https://www.gaia.com/yoga?utm_source=email'
      const redirectUrl = 'https://www.google.com/account?test=1'
      const expectedRedirectUrl = 'https://www.google.com/account?test=1&utm_source=email'
      const formattedRedirectUrl = createRedirectUrl(redirectUrl, origin, { originalUrl })

      assert.equal(
        formattedRedirectUrl,
        expectedRedirectUrl,
      )
    })
    it('make sure original url query string params overwrite the redirect params if there is a collision', () => {
      const origin = 'www.gaia.com'
      const originalUrl = 'https://www.gaia.com/yoga?utm_source=email'
      const redirectUrl = 'https://www.google.com/account?test=1&utm_source=social'
      const expectedRedirectUrl = 'https://www.google.com/account?test=1&utm_source=email'
      const formattedRedirectUrl = createRedirectUrl(redirectUrl, origin, { originalUrl })

      assert.equal(
        formattedRedirectUrl,
        expectedRedirectUrl,
      )
    })
    it('make sure the redirect query param is passed when there is no original url query string', () => {
      const origin = 'www.gaia.com'
      const originalUrl = 'https://www.gaia.com/yoga'
      const redirectUrl = 'https://www.google.com/account?test=1'
      const expectedRedirectUrl = 'https://www.google.com/account?test=1'
      const formattedRedirectUrl = createRedirectUrl(redirectUrl, origin, { originalUrl })

      assert.equal(
        formattedRedirectUrl,
        expectedRedirectUrl,
      )
    })
    it('make sure the the url is correct when there is no query strings', () => {
      const origin = 'www.gaia.com'
      const originalUrl = 'https://www.gaia.com/yoga'
      const redirectUrl = 'https://www.google.com/account'
      const expectedRedirectUrl = 'https://www.google.com/account'
      const formattedRedirectUrl = createRedirectUrl(redirectUrl, origin, { originalUrl })

      assert.equal(
        formattedRedirectUrl,
        expectedRedirectUrl,
      )
    })
  })

  describe('Function upgradeToHttps()', () => {
    it('understands when to redirect to https', () => {
      assert.isTrue(upgradeToHttps({ get: () => 'http' }))
      assert.isFalse(upgradeToHttps({ get: () => 'https' }))
    })
  })

  describe('Function changeHostname()', () => {
    it('understands when to redirect to a hostname', () => {
      assert.isFalse(changeHostname({ hostname: DOMAIN }, ORIGIN))
      assert.isTrue(changeHostname({ hostname: TLD }, ORIGIN))
      assert.isTrue(changeHostname({ hostname: SUB_DOMAIN }, ORIGIN))
    })
  })

  describe('Function changeUrlFormat()', () => {
    it('understands when to format path for SEO', () => {
      assert.isTrue(changeUrlFormat({ originalUrl: `${ORIGIN}/fiLMs-dOCS/fILms` }))
      assert.isFalse(
        changeUrlFormat({ originalUrl: `${ORIGIN}/films-docs/films` }),
        'Should not affect urls with paths that are already lowercase.',
      )
      assert.isFalse(
        changeUrlFormat({
          originalUrl: `${ORIGIN}/films-docs/films?CaseSensitiveQuery`,
        }),
        'Should not affect paths that are already lowercase, regardless of query case',
      )
      assert.isTrue(
        changeUrlFormat({ originalUrl: `${ORIGIN}/films-docs/films/` }),
        'Should format urls with a trailing slash',
      )
      assert.isTrue(
        changeUrlFormat({ originalUrl: `${ORIGIN}/style/yoga-meditation/` }),
        'Should format urls with a trailing slash',
      )
      assert.isTrue(
        changeUrlFormat({ originalUrl: `${ORIGIN}/style/yoga-meditation////` }),
        'Should format urls with multiple trailing slashes',
      )
      assert.isFalse(
        changeUrlFormat({ originalUrl: `${ORIGIN}/style/yoga-meditation` }),
        'Should not format urls that are lowercase and have no trailing slash',
      )
    })
    it('should add trailing slash to lp urls', () => {
      assert.isTrue(changeUrlFormat({ originalUrl: `${ORIGIN}/style/yoga-meditation` }, { persistTrailingSlash: true }))
    })
    it('should return false when there is a file extnsion on pathname', () => {
      assert.isFalse(changeUrlFormat({ originalUrl: `${ORIGIN}/style/yoga-meditation.otf` }))
    })
    it('does not affect affiliate urls', () => {
      assert.isFalse(changeUrlFormat({ originalUrl: 'http://affiliate.com/Some/Path' }))
      assert.isFalse(
        changeUrlFormat({
          originalUrl: 'http://affiliate.com/some/path?WithCapsParams',
        }),
      )
      assert.isFalse(changeUrlFormat({ originalUrl: 'http://AFFILIATE.com/Some/Path' }))
      assert.isFalse(
        changeUrlFormat({
          originalUrl:
            'http://click.linksynergy.com/fs-bin/click?id=hs1e0O6hYd0&offerid=418693.10002017&type=3&subid=0',
        }),
      )
      assert.isFalse(
        changeUrlFormat({
          originalUrl:
            'http://Click.LinkSynergy.com/FS-BIN/click?id=hs1e0O6hYd0&offerid=418693.10002017&type=3&subid=0',
        }),
      )
    })
    it('does not strip singlular trailing slash from root aka home url', () => {
      assert.isFalse(
        changeUrlFormat({ originalUrl: '/' }),
        'Should not affect root url path slash',
      )
      assert.isFalse(
        changeUrlFormat({ originalUrl: `${ORIGIN}/` }),
        'Should not affect root url path slash',
      )
      assert.isTrue(
        changeUrlFormat({ originalUrl: '//' }),
        'Should strip multiple strailing slashes',
      )
      assert.isTrue(
        changeUrlFormat({ originalUrl: `${ORIGIN}//` }),
        'Should strip double trailing slash.',
      )
    })
  })

  describe('Function shouldFormatUrl()', () => {
    it('determines whether urls should be formatted for SEO or left alone', () => {
      assert.isTrue(
        shouldFormatUrl(ORIGIN),
        'Should format urls from web app domain',
      )
      assert.isFalse(
        shouldFormatUrl('http://affiliate.com/Some/Path'),
        'Should not format urls with affiliate domains.',
      )
      assert.isFalse(
        shouldFormatUrl(
          'http://click.linksynergy.com/fs-bin/click?id=hs1e0O6hYd0&offerid=418693.10002017&type=3&subid=0',
        ),
        'Should not format urls with affiliate domains.',
      )
      assert.isFalse(
        shouldFormatUrl(
          'http://click.linksynergy.com/fs-bin/click?id=hs1e0O6hYd0&offerid=418693.10002017&type=3&subid=0/',
        ),
        'Should not format urls with affiliate domains.',
      )
      assert.isTrue(
        shouldFormatUrl(''),
        'Should format urls if host is null while developing on localhost',
      )
      assert.isTrue(
        shouldFormatUrl(getOrigin()),
        'Should format environment-specific web app urls',
      )
    })
  })

  describe('Function stripPathnameTrailingSlashes()', () => {
    it('should strip trailing slashes from the request', () => {
      assert.equal(stripPathnameTrailingSlashes('/films-docs/films/'), '/films-docs/films', 'remove one trailing slash')
      assert.equal(stripPathnameTrailingSlashes('/films-docs/films//'), '/films-docs/films', 'remove two trailing slashes')
      assert.equal(stripPathnameTrailingSlashes('/films-docs/films'), '/films-docs/films')
      assert.equal(stripPathnameTrailingSlashes('//'), '/')
      assert.equal(stripPathnameTrailingSlashes('/'), '/')
    })
  })

  describe('Function addPathnameTrailingSlash()', () => {
    it('should add trailing slashes to an empty string', () => {
      assert.equal(addPathnameTrailingSlash(''), '/')
    })
    it('should add trailing slashes to /lp/about page string', () => {
      assert.equal(addPathnameTrailingSlash('/lp/about'), '/lp/about/')
    })
  })

  describe('Function changeToResolverPath()', () => {
    it('understands when to redirect to a path', () => {
      assert.isNotOk(
        changeToResolverPath({
          hydrate: {
            resolver: {},
          },
        }),
      )
      assert.isOk(
        changeToResolverPath({
          hydrate: {
            resolver: {
              data: {
                redirectType: 301,
                url: '/',
              },
            },
          },
        }),
      )
      assert.isNotOk(
        changeToResolverPath({
          hydrate: {
            resolver: {
              data: {
                redirectType: 301,
              },
            },
          },
        }),
      )
      assert.isNotOk(
        changeToResolverPath({
          hydrate: {
            resolver: {
              data: {
                url: '/',
              },
            },
          },
        }),
      )
    })
  })
})
