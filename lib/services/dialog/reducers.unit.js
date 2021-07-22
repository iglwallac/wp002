import { describe, it } from 'mocha'
import { assert } from 'chai'
import reducers, { initialState } from './reducers'
import { setDailogComponentName } from './actions'
import { TYPE_FORGOT_PASSWORD } from './'

describe('service dialog reducers', () => {
  describe('Reducer SET_DIALOG_COMPONENT_NAME', () => {
    it('sets componentName in state', () => {
      const state = reducers(
        initialState,
        setDailogComponentName(TYPE_FORGOT_PASSWORD),
      )
      assert.equal(state.get('componentName'), TYPE_FORGOT_PASSWORD)
    })
  })
})
