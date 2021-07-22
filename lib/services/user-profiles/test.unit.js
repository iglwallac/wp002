import { before, afterEach, describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import { Map } from 'immutable'
import nock from 'nock'
import { get as getConfig } from 'config'
import { postUserProfile, getProfiles } from './index'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

const config = getConfig()

const USER_PROFILE_RESPONSE = {
  email: 'test12345@gmail.com',
  first_name: 'test',
  last_name: 'test',
  username: 'test',
  uid: 1234,
}

const ALL_USER_PROFILES_DATA = [USER_PROFILE_RESPONSE]

function createUserProfileNock () {
  return nock(config.servers.brooklyn)
    .post('/v1/create-user-profile')
    .reply(200, USER_PROFILE_RESPONSE)
}

function createAuthUserAccountNock () {
  return nock(config.servers.brooklyn)
    .get('/v1/user-account')
    .reply(200, ALL_USER_PROFILES_DATA)
}

describe('service user-profile', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  describe('Function: postUserProfile()', () => {
    it('should return a created user profile', () => {
      const expected = USER_PROFILE_RESPONSE
      const scope = createUserProfileNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      return assert.isFulfilled(postUserProfile({
        firstName: 'test',
        lastName: 'test',
        email: 'test12345@gmail.com',
        auth,
      }).then((data) => {
        assert.isTrue(scope.isDone(), 'auth endpoint called')
        assert.equal(expected.email, data.data.email)
        assert.equal(expected.uid, data.data.uid)
      }))
    })
  })
  describe('Function: getProfiles()', () => {
    it('should return a created user profile', () => {
      const expected = ALL_USER_PROFILES_DATA
      const scope = createAuthUserAccountNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      return assert.isFulfilled(getProfiles({ auth }).then((data) => {
        assert.isTrue(scope.isDone(), 'auth endpoint called')
        assert.equal(expected.length, data.data.length)
        assert.equal(expected[0].email, data.data[0].email)
        assert.equal(expected[0].uid, data.data[0].uid)
      }))
    })
  })
})
