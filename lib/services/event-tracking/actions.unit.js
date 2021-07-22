import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import {
  setEventPageViewed,
  SET_EVENT_PAGE_VIEWED,
} from './actions'

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
const app = Map({
  name: 'web-app',
  version: '0.0.1',
})
const date = new Date()

describe('service event-tracking actions', () => {
  describe('Function: setEventPageViewed()', () => {
    it('should create an action', () => {
      const action = setEventPageViewed({
        auth,
        page,
        location,
        windowLocation,
        date,
        app,
      })
      assert.equal(action.type, SET_EVENT_PAGE_VIEWED)
      assert.equal(action.payload.event.get('event'), 'Page Viewed')
    })
  })
})
