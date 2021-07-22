import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import { setEventPageViewed } from './actions'

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
const app = Map({
  name: 'web-app',
  version: '0.0.1',
})
const date = new Date()

describe('service event-tracking reducers', () => {
  describe('Reducer SET_EVENT_PAGE_VIEWED', () => {
    it('should set a page viewed event in the store', () => {
      const state = reducers(
        initialState,
        setEventPageViewed({ auth, page, location, windowLocation, date, app }),
      )
      assert.equal(state.getIn(['data', 0, 'event']), 'Page Viewed')
    })
  })
})
