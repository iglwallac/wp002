import { before, afterEach, describe, it } from 'mocha'
import _get from 'lodash/get'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import { Map, List } from 'immutable'
import nock from 'nock'
import { get as getConfig } from 'config'
import { EN } from 'services/languages/constants'
import BROOKLYN_USER_DATA from './test/brooklyn-user.json'
import AUTH_PROFILE_IMAGE_DATA from './test/auth-profile-image.json'
import AUTH_USER_UPDATE_DATA from './test/auth-user-update.json'
import { get, putUserProfileImages, removeUserProfileImages, updateUserInfo, getUserLanguage } from '.'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

const config = getConfig()

function createUserNock () {
  return nock(config.servers.auth)
    .get('/user')
    .query({ view: 'detail' })
    .reply(200, BROOKLYN_USER_DATA)
}

function createUserProfileImagesNock () {
  return nock(config.servers.auth)
    .put('/v1/user/image', AUTH_PROFILE_IMAGE_DATA)
    .reply(200, {
      profile: 'profile-url',
      avatar: 'avatar-url',
    })
}

function createDeleteUserProfileImagesNock () {
  return nock(config.servers.auth)
    .delete('/v1/user/image')
    .reply(204)
}

function createUpdateUserNock () {
  return nock(config.servers.auth)
    .put('/v1/user', AUTH_USER_UPDATE_DATA)
    .reply(200, BROOKLYN_USER_DATA)
}

describe('service user', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('Function: getUserLanguage()', () => {
    it('should get the user\'s language when the data language property exists', async () => {
      const language = List([EN])
      const user = Map({ data: Map({ language }) })
      assert.equal(getUserLanguage(user), language)
    })
    it('should get undefined when the user is a Map and the data property does not exist', async () => {
      const user = Map()
      assert.isUndefined(getUserLanguage(user))
    })
    it('should get undefined when the user is not Map', async () => {
      assert.isUndefined(getUserLanguage())
    })
  })

  describe('Function: get()', () => {
    it('should get the user', async () => {
      const scope = createUserNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      const data = await assert.isFulfilled(get({ auth }))
      assert.isTrue(scope.isDone(), 'auth api endpoint called')
      assert.equal(_get(BROOKLYN_USER_DATA, 'uid'), _get(data, 'uid'))
      assert.equal(_get(BROOKLYN_USER_DATA, ['profile', 'picture', 'small_28x28']), _get(data, ['avatar', 'small']))
    })
  })
  describe('Function: putUserProfileImages()', () => {
    it('should put the user profile images', () => {
      const scope = createUserProfileImagesNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      const profile = _get(AUTH_PROFILE_IMAGE_DATA, 'profile')
      const avatar = _get(AUTH_PROFILE_IMAGE_DATA, 'avatar')
      const success = true
      const statusCode = 200
      return assert.isFulfilled(putUserProfileImages({ profile, avatar, auth })
        .then((data) => {
          assert.isTrue(scope.isDone(), 'auth api endpoint called')
          assert.equal(success, _get(data, 'success'))
          assert.equal(statusCode, _get(data, 'statusCode'))
        }))
    })
  })
  describe('Function: removeUserProfileImages()', () => {
    it('should delete the user profile images', () => {
      const scope = createDeleteUserProfileImagesNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      const success = true
      const statusCode = 204
      return assert.isFulfilled(removeUserProfileImages({ auth })
        .then((data) => {
          assert.isTrue(scope.isDone(), 'auth api endpoint called')
          assert.equal(success, _get(data, 'success'))
          assert.equal(statusCode, _get(data, 'statusCode'))
        }))
    })
  })
  describe('Function: updateUserInfo()', () => {
    it('should put the user updates', async () => {
      const scope = createUpdateUserNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      const email = _get(AUTH_USER_UPDATE_DATA, 'email')
      const bio = _get(AUTH_USER_UPDATE_DATA, 'bio')
      const location = _get(AUTH_USER_UPDATE_DATA, 'location')
      const success = true
      const statusCode = 200
      const data = await assert.isFulfilled(updateUserInfo({ email, bio, location, auth }))
      assert.isTrue(scope.isDone(), 'auth api endpoint called')
      assert.equal(success, _get(data, 'success'))
      assert.equal(statusCode, _get(data, 'statusCode'))
    })
  })
})
