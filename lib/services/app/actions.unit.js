import { describe, it } from 'mocha'
import { assert } from 'chai'
import { BOOTSTRAP_PHASE_INIT } from '.'
import {
  SET_APP_BOOTSTRAP_PHASE,
  setAppBootstrapPhase,
} from './actions'

describe('service app actions', () => {
  describe('Function: setAppBootstrapPhase()', () => {
    it('should create an action', () => {
      const value = BOOTSTRAP_PHASE_INIT
      const action = {
        type: SET_APP_BOOTSTRAP_PHASE,
        payload: {
          phase: value,
          isComplete: false,
        },
      }
      assert.deepEqual(
        action,
        setAppBootstrapPhase(value),
      )
    })
  })
})
