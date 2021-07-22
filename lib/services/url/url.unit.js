import { describe, it } from 'mocha'
import { assert } from 'chai'
import { get as getConfig } from 'config'
import {
  isRelative,
  isFullUrl,
  isAnchor,
  createAbsolute,
  isVideo,
  isSeries,
  isFast404,
  isMultiplePlaylistsPage,
} from './'

describe('service url', () => {
  describe('Function isRelative()', () => {
    it('"isRelative" with a relative path', () => {
      assert.isTrue(isRelative('my-yoga/hatha'), 'Relative path returns "true"')
    })
    it('"isRelative" with a path relative to the root', () => {
      assert.isFalse(
        isRelative('/my-yoga/hatha'),
        'Relative path returns "false"',
      )
    })
    it('"isRelative" with an absolute path', () => {
      assert.isFalse(
        isRelative('http://www.gaia.com/my-yoga/hatha'),
        'Absolute path returns "false"',
      )
    })
  })

  describe('Function isFullUrl()', () => {
    it('"isFullUrl" with an absolute path', () => {
      assert.isTrue(
        isFullUrl('http://www.gaia.com/my-yoga/hatha'),
        'Absolute path returns "true"',
      )
    })
    it('isFullUrl" with a path relative to the root', () => {
      assert.isFalse(
        isFullUrl('/my-yoga/hatha'),
        'Absolute path returns "false"',
      )
    })
    it('"isFullUrl" with a relative path', () => {
      assert.isFalse(
        isFullUrl('my-yoga/hatha'),
        'Relative path returns "false"',
      )
    })
  })

  describe('Function isAnchor()', () => {
    it('"isAnchor" with a well-formed anchor', () => {
      assert.isTrue(isAnchor('#foo'), 'Provided string is an anchor')
    })
    it('"isAnchor" with a malformed anchor', () => {
      assert.isFalse(isAnchor('##foo'), 'Anchor should be rejected')
    })
    it('"isAnchor" with a malformed anchor', () => {
      assert.isFalse(isAnchor('my-yoga/hatha#foo'), 'Anchor should be rejected')
    })
    it('"isAnchor" with a relative path (no anchor)', () => {
      assert.isFalse(isAnchor('my-yoga/hatha'), 'Path should be rejected')
    })
  })

  describe('Function createAbsolute()', () => {
    it('"createAbsolute" with a relative path', () => {
      assert.isTrue(
        createAbsolute('my-yoga/hatha') ===
          `${getConfig().baseHref}my-yoga/hatha`,
        'Path returned is absolute',
      )
    })
    it('"createAbsolute" with a relative path', () => {
      assert.isFalse(
        createAbsolute('#foo') === `${getConfig().baseHref}my-yoga/hatha`,
        'Path is rejected',
      )
    })
    it('"createAbsolute" with a relative path', () => {
      assert.isTrue(
        createAbsolute('/my-yoga/hatha') === '/my-yoga/hatha',
        'Path returned is absolute',
      )
    })
    it('"createAbsolute" with a relative path', () => {
      assert.isTrue(
        createAbsolute('http://www.gaia.com/my-yoga/hatha') ===
          'http://www.gaia.com/my-yoga/hatha',
        'Path returned is absolute',
      )
    })
  })

  describe('Function isFast404()', () => {
    it('"isFast404" url with extension', () => {
      assert.isTrue(isFast404('/test.jpg'), 'jpg should be a match')
      assert.isTrue(isFast404('/test.GIF'), 'GIF should be a match')
      assert.isTrue(isFast404('/test.pNg'), 'pNg should be a match')
    })
    it('"isFast404" starts with /sites/default', () => {
      assert.isTrue(
        isFast404('/sites/default'),
        '/sites/default should be a match',
      )
      assert.isTrue(
        isFast404('/sites/default/test'),
        '/sites/default/test should be a match',
      )
      assert.isTrue(
        isFast404('/sites/default/files/test.png'),
        '/sites/default/files/test.png should be a match',
      )
    })
    it('"isFast404"', () => {
      assert.isFalse(
        isFast404('/sites/not-default'),
        '/sites/not-default should not be a match',
      )
      assert.isFalse(isFast404('/'), '/ should not be a match')
      assert.isFalse(
        isFast404('/video/cosmic-disclosure'),
        '/video/cosmic-disclosure should not be a match',
      )
      assert.isFalse(
        isFast404('/seeking-truth/secrets-cover-ups'),
        '/seeking-truth/secrets-cover-ups should not be a match',
      )
    })
  })

  describe('Function isVideo()', () => {
    it('"isVideo" with a well-formed path', () => {
      assert.isTrue(isVideo('/video/'), 'Function should return "true"')
    })
    it('"isVideo" with a malformed path', () => {
      assert.isFalse(isVideo('/series/'), 'Function should return "false"')
    })
  })

  describe('Function isSeries()', () => {
    it('"isSeries" with a well-formed path', () => {
      assert.isTrue(isSeries('/tv/'), 'Function should return "true"')
    })
    it('"isSeries" with a well-formed path', () => {
      assert.isTrue(isSeries('/show/'), 'Function should return "true"')
    })
    it('"isSeries" with a well-formed path', () => {
      assert.isTrue(isSeries('/series/'), 'Function should return "true"')
    })
    it('"isSeries" with a malformed path', () => {
      assert.isFalse(isSeries('/video/'), 'Function should return "false"')
    })
  })

  describe('Function isMultiplePlaylistsPage()', () => {
    it('"isMultiplePlaylistsPage" with a well-formed path', () => {
      assert.isTrue(isMultiplePlaylistsPage('/playlist/default'), 'Function should return "true"')
    })
    it('"isMultiplePlaylistsPage" with a well-formed path', () => {
      assert.isTrue(isMultiplePlaylistsPage('/playlist/custom-playlist-1'), 'Function should return "true"')
    })
    it('"isMultiplePlaylistsPage" with a malformed path', () => {
      assert.isFalse(isMultiplePlaylistsPage('/playlist'), 'Function should return "false"')
    })
  })
})
