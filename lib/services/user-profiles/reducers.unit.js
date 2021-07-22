import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import reducers, { initialState } from './reducers'
import { USER_PROFILES_SET } from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service user-profiles reducers', () => {
  describe(`Reducer ${USER_PROFILES_SET}`, () => {
    it('should set data and processing in state', () => {
      const userProfiles = [{ uid: 1234 }]
      const processing = false
      const state = reducers(initialState, {
        type: USER_PROFILES_SET,
        payload: { data: userProfiles },
      })
      assert.equal(userProfiles[0].uid, state.getIn(['data', 0, 'uid']))
      assert.equal(processing, state.get('processing'))
    })
  })
})
