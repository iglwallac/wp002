import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import reducers, { initialState } from './reducers'
import { BOOTSTRAP_PHASE_INIT } from '.'
import {
  SET_APP_BOOTSTRAP_PHASE,
  setAppBootstrapPhase,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service app reducers', () => {
  describe(`Reducer ${SET_APP_BOOTSTRAP_PHASE}`, () => {
    it('should set bootstrap.phase in state', () => {
      const phase = BOOTSTRAP_PHASE_INIT
      const state = reducers(
        initialState,
        setAppBootstrapPhase(phase),
      )
      assert.equal(phase, state.get('bootstrapPhase'))
    })
  })
})
