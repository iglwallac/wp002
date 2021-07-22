import { describe, it, before, after } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import nock from 'nock'
import { Map } from 'immutable'
import {
  sentAtDate,
  createDefaultEvent,
  buildEventVideoPlayed,
  buildEventShelfExpanded,
  buildEventVideoVisited,
  buildEventSeriesVisited,
  buildEventVideoView,
  buildEventPlaylistVideoAdded,
  buildEventGiftVideoViewed,
  buildEventPageViewed,
} from './index'

chai.use(chaiImmutable)
const { assert } = chai

const auth = Map({
  uid: 123,
})
const page = Map({
  title: 'Test Page',
})
const location = {
  hash: 'hash',
  pathname: 'pathname',
  search: 'search',
}
const windowLocation = {
  href: 'http://localhost/test?test=1#test',
}
const video = Map({
  id: 456,
})
const media = Map({
  id: 789,
})
const app = Map({
  name: 'web-app',
  version: '0.0.1',
})
const date = new Date()

function assertDefaultEvent (event) {
  const contextPage = event.getIn(['context', 'page'])
  const contextApp = event.getIn(['context', 'app'])
  assert.equal(event.get('timestamp'), date.toISOString())
  assert.equal(event.get('userId'), auth.get('uid'))
  assert.equal(contextPage.get('hash'), location.hash)
  assert.equal(contextPage.get('path'), location.pathname)
  assert.equal(contextPage.get('search'), location.search)
  assert.equal(contextPage.get('title'), page.get('title'))
  assert.equal(contextPage.get('url'), windowLocation.href)
  assert.equal(contextApp.get('name'), app.get('name'))
  assert.equal(contextApp.get('version'), app.get('version'))
}

describe('service event-tracking', () => {
  before(() => {
    nock.disableNetConnect()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe('Function: sentAtDate()', () => {
    it('should return the date formatted correctly', () => {
      assert.equal(sentAtDate(date), date.toISOString())
    })
  })
  describe('Function: createDefaultEvent()', () => {
    it('should create the default fields on a event', () => {
      const event = createDefaultEvent({
        auth,
        page,
        location,
        windowLocation,
        date,
        app,
      })
      assertDefaultEvent(event)
    })
  })
  describe('Function: buildEventVideoPlayed()', () => {
    it('should create a video played event', () => {
      const event = buildEventVideoPlayed({
        auth,
        page,
        location,
        windowLocation,
        date,
        video,
        media,
        app,
      })
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Video Played')
      assert.equal(event.get('videoId'), video.get('id'))
      assert.equal(event.get('mediaId'), media.get('id'))
    })
  })
  describe('Function: buildEventShelfExpanded()', () => {
    it('should create a shelf expanded event', () => {
      const shelf = Map({
        event: 'Shelf Expanded',
        type: 'test',
        id: 456,
      })
      const event = buildEventShelfExpanded({
        auth,
        page,
        location,
        windowLocation,
        date,
        shelf,
        app,
      })
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Shelf Expanded')
      assert.equal(event.get('contentType'), shelf.get('type'))
      assert.equal(event.get('contentId'), shelf.get('id'))
    })
  })
  describe('Function: buildEventVideoVisited()', () => {
    it('should create a video visited event', () => {
      const event = buildEventVideoVisited({
        auth,
        page,
        location,
        windowLocation,
        date,
        id: video.get('id'),
        app,
      })
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Video Visited')
      assert.equal(event.get('videoId'), video.get('id'))
    })
  })
  describe('Function: buildEventVideoView()', () => {
    it('should create a video view qualified event', () => {
      const event = buildEventVideoView({
        auth,
        page,
        location,
        windowLocation,
        date,
        video,
        app,
        media,
      }, 'Qualified')
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Video View Qualified')
      assert.equal(event.get('videoId'), video.get('id'))
      assert.equal(event.get('mediaId'), media.get('id'))
    })
  })
  describe('Function: buildEventPlaylistVideoAdded()', () => {
    it('should create a playlist video added event', () => {
      const event = buildEventPlaylistVideoAdded({
        auth,
        page,
        location,
        windowLocation,
        date,
        id: video.get('id'),
        app,
      })
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Playlist Video Added')
      assert.equal(event.get('videoId'), video.get('id'))
    })
  })
  describe('Function: buildEventGiftVideoViewed()', () => {
    it('should create a gift video viewed event', () => {
      const siteSegment = Map({
        id: 123,
        name: 'test',
      })
      const event = buildEventGiftVideoViewed({
        auth,
        page,
        location,
        windowLocation,
        date,
        siteSegment,
        app,
      })
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Gift Video Viewed')
      assert.equal(event.getIn(['siteSegment', 'id']), siteSegment.get('id'))
      assert.equal(
        event.getIn(['siteSegment', 'name']),
        siteSegment.get('name'),
      )
    })
  })
  describe('Function: buildEventSeriesVisited()', () => {
    it('should create a series visted event', () => {
      const series = Map({
        id: 456,
      })
      const event = buildEventSeriesVisited({
        auth,
        page,
        location,
        windowLocation,
        date,
        id: series.get('id'),
        app,
      })
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Series Visited')
      assert.equal(event.get('seriesId'), series.get('id'))
    })
  })
  describe('Function: buildEventPageViewed()', () => {
    it('should create a page viewed event', () => {
      const event = buildEventPageViewed({
        auth,
        page,
        location,
        windowLocation,
        date,
        app,
      })
      assertDefaultEvent(event)
      assert.equal(event.get('event'), 'Page Viewed')
    })
  })
})
