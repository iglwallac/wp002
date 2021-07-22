import { describe, it } from 'mocha'
import { assert } from 'chai'
import { setDailogComponentName, SET_DIALOG_COMPONENT_NAME } from './actions'
import { TYPE_FORGOT_PASSWORD } from './index'

describe('service dialog actions', () => {
  describe('Function: setDailogComponentName()', () => {
    it('creates correct action', () => {
      const action = {
        payload: { name: TYPE_FORGOT_PASSWORD },
        type: SET_DIALOG_COMPONENT_NAME,
      }
      assert.deepEqual(setDailogComponentName(TYPE_FORGOT_PASSWORD), action)
    })
  })
})
