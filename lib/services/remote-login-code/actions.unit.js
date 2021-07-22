import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  setRemoteLoginCodeData,
  setRemoteLoginCodeProcessing,
  SET_REMOTE_LOGIN_CODE_PROCESSING,
  SET_REMOTE_LOGIN_CODE_DATA,
} from './actions'

describe('service remote-login-code actions', () => {
  describe('Function: setRemoteLoginCodeProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_REMOTE_LOGIN_CODE_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(
        action,
        setRemoteLoginCodeProcessing(processing),
      )
    })
  })

  describe('Function: setRemoteLoginCodeData()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_REMOTE_LOGIN_CODE_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setRemoteLoginCodeData(data, processing),
      )
    })
  })
})
