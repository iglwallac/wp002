import { describe, it, before, after } from 'mocha'
import { assert } from 'chai'
import { login, logout } from 'services/auth'
import { fromJS } from 'immutable'
import { Promise as BluebirdPromise } from 'bluebird'
import { get, set, reset } from './'

describe('service feature-tracking integration', () => {
  let auth
  before(() => new BluebirdPromise((resolve, reject) => {
    login({ username: 'peon', password: 'peon' })
      .then((data) => {
        auth = data.jwt
        reset({ auth })
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
  }))
  after(() => {
    if (auth) {
      return logout({ auth })
    }
    return BluebirdPromise.resolve()
  })
  describe('Function: set()', () => {
    it('should have an authentication token', () => {
      assert.isOk(auth)
    })
    it('should set userLanguages', () => {
      const data = fromJS({ userLanguages: ['en'] })
      return new BluebirdPromise((resolve, reject) => {
        set({ auth, data })
          .then(() => {
            get({ auth })
              .then((results) => {
                assert.deepEqual(
                  results.get('userLanguages'),
                  data.get('userLanguages'),
                )
                resolve()
              })
              .catch(reject)
          })
          .catch(reject)
      })
    })
    it('should set explainerPlaylistEdit', () => {
      const date = new Date()
      const data = fromJS({ explainerPlaylistEdit: date.toISOString() })
      return new BluebirdPromise((resolve, reject) => {
        set({ auth, data })
          .then(() => {
            get({ auth })
              .then((results) => {
                assert.equal(
                  results.get('explainerPlaylistEdit'),
                  data.get('explainerPlaylistEdit'),
                )
                resolve()
              })
              .catch(reject)
          })
          .catch(reject)
      })
    })
  })
})
