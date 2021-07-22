import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { parse as parseUrl } from 'url'
import { fromJS, Map } from 'immutable'
import {
  parseQuery,
  containsUtm,
  containsSiteID,
  containsChan,
  containsCid,
} from './'

chai.use(chaiImmutable)
const { assert } = chai

const URL_WITH_UTM =
  'https://www.gaia.com/?utm_source=1&utm_medium=2&utm_term=3&utm_campaign=4&utm_content=5&ch=st'
const URL_WITH_CID = 'https://www.gaia.com/?cid=1'
const URL_WITH_BAD_UTM = 'https://www.gaia.com/?utm_notreal=1'
const URL_WITH_SITEID = 'https://www.gaia.com/?siteID=1'
const URL_WITH_CHAN = 'https://www.gaia.com/?chan=hotdog'
const URL_WITHOUT_SITEID = 'https://www.gaia.com/?badKey=1'

const timestamp = new Date()
const INBOUND_TRACKING_WITH_UTM = fromJS({
  utm_source: '1',
  utm_medium: '2',
  utm_term: '3',
  utm_campaign: '4',
  utm_content: '5',
  ch: 'st',
  strings: {
    utm:
      'utm_source=1&utm_medium=2&utm_term=3&utm_campaign=4&utm_content=5&ch=st',
  },
})

const INBOUND_TRACKING_WITH_SITEID = fromJS({
  siteID: '1',
  linkshare: {
    siteID: '1',
    timestamp,
  },
})

describe('service inbound-tracking', () => {
  describe('Function: parseQuery()', () => {
    it('parses query strings', () => {
      assert.isTrue(
        parseQuery(parseUrl(URL_WITH_UTM, true).query, timestamp).equals(
          INBOUND_TRACKING_WITH_UTM,
        ),
      )
      assert.isTrue(
        parseQuery(parseUrl(URL_WITH_SITEID, true).query, timestamp).equals(
          INBOUND_TRACKING_WITH_SITEID,
        ),
      )
    })
    it('should create an inbound tracking Map with only the variables it needs', () => {
      const _timestamp = new Date()
      const queryTracking = Map({
        utm_source: 'utm_source',
        utm_medium: 'utm_medium',
        utm_term: 'utm_term',
        utm_campaign: 'utm_campaign',
        utm_content: 'utm_content',
        ch: 'ch',
        ci_type: 'ci_type',
        ci_id: '1234',
        siteID: 'siteID',
        chan: 'chan',
      })
      const queryOther = Map({
        test: 1,
        page: 10,
      })
      const expected = Map({
        utm_campaign: 'utm_campaign',
        strings: Map({
          utm: 'utm_campaign=utm_campaign&ch=ch&utm_medium=utm_medium&utm_content=utm_content&utm_source=utm_source&utm_term=utm_term',
        }),
        siteID: 'siteID',
        linkshare: Map({ siteID: 'siteID', timestamp: _timestamp }),
        ch: 'ch',
        utm_medium: 'utm_medium',
        utm_content: 'utm_content',
        utm_source: 'utm_source',
        chan: 'chan',
        ci_type: 'ci_type',
        ci_id: '1234',
        utm_term: 'utm_term',
      })
      assert.equal(
        expected,
        parseQuery(queryTracking.merge(queryOther).toJS(), _timestamp),
      )
    })
  })

  describe('Function: containsUtm()', () => {
    it('detects utm querys', () => {
      assert.isTrue(
        containsUtm(parseQuery(parseUrl(URL_WITH_UTM, true).query, timestamp)),
      )
      assert.isFalse(
        containsUtm(parseQuery(parseUrl(URL_WITH_CID, true).query, timestamp)),
      )
      // This tests only valid utm vars we don't take just anything with utm_
      assert.isFalse(
        containsUtm(
          parseQuery(parseUrl(URL_WITH_BAD_UTM, true).query, timestamp),
        ),
      )
    })
  })

  describe('Function: containsSiteID()', () => {
    it('detects siteID query', () => {
      assert.isTrue(
        containsSiteID(
          parseQuery(parseUrl(URL_WITH_SITEID, true).query, timestamp),
        ),
      )
      assert.isFalse(
        containsSiteID(
          parseQuery(parseUrl(URL_WITHOUT_SITEID, true).query, timestamp),
        ),
      )
    })
  })

  describe('Function: containsChan()', () => {
    it('detects chan query', () => {
      assert.isTrue(
        containsChan(parseQuery(parseUrl(URL_WITH_CHAN, true).query)),
      )
      assert.isFalse(
        containsChan(parseQuery(parseUrl(URL_WITH_SITEID, true).query)),
      )
    })
  })

  describe('Function: containsCid()', () => {
    it('detects cid query', () => {
      assert.isTrue(containsCid(parseQuery(parseUrl(URL_WITH_CID, true).query)))
      assert.isFalse(
        containsCid(parseQuery(parseUrl(URL_WITH_SITEID, true).query)),
      )
    })
  })
})
