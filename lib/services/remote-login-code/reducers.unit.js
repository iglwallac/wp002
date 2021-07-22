import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setRemoteLoginCodeData,
  setRemoteLoginCodeProcessing,
  SET_REMOTE_LOGIN_CODE_PROCESSING,
  SET_REMOTE_LOGIN_CODE_DATA,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service remote-login-code reducers', () => {
  describe(`Reducer ${SET_REMOTE_LOGIN_CODE_DATA}`, () => {
    it('should set setRemoteLoginCodeData and approveRemoteLoginCodeProcessing in state', () => {
      const data = fromJS({
        remoteLoginCodeSuccessfullyActivated: true,
        activatedCode: '999999',
      })
      const processing = false
      const state = reducers(
        initialState,
        setRemoteLoginCodeData(data, processing),
      )
      assert.equal(
        data.get('activatedCode'),
        state.getIn(['data', 'activatedCode']),
      )
      assert.equal(processing, state.get('approveRemoteLoginCodeProcessing'))
    })
  })
  describe(`Reducer ${SET_REMOTE_LOGIN_CODE_PROCESSING}`, () => {
    it('should set approveRemoteLoginCodeProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setRemoteLoginCodeProcessing(value),
      )
      assert.equal(value, state.get('approveRemoteLoginCodeProcessing'))
    })
  })
})
