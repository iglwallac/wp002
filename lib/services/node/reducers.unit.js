import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS, Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  dispatchSetNode,
  SET_NODES,
  clearNodes,
  REMOVE_NODES,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service node reducers', () => {
  describe(`Reducer ${SET_NODES}`, () => {
    it('should set node in state when view exists', () => {
      let action = {}
      function dispatch (args) {
        action = args
      }
      const view = 'view'
      const key = 'test'
      const node = { test: true }
      dispatchSetNode(view, key, [node], dispatch)
      const state = reducers(initialState, action)
      assert.equal(state.getIn([view, key]), fromJS([node]))
    })
    it('should set node in state when view does not exist', () => {
      let action = {}
      function dispatch (args) {
        action = args
      }
      const key = 'test'
      const node = { test: true }
      dispatchSetNode(undefined, key, [node], dispatch)
      const state = reducers(initialState, action)
      assert.equal(state.get(key), fromJS([node]))
    })
  })
  describe(`Reducer ${REMOVE_NODES}`, () => {
    it('should remove all nodes when there is no view and key', () => {
      const state = reducers(initialState.set('test', true), clearNodes())
      assert.equal(state, initialState)
    })
    it('should remove key when there is a key', () => {
      const key = 'test'
      const state = reducers(initialState.setIn([key], 'test', true), clearNodes({ key }))
      assert.equal(state, initialState)
    })
    it('should remove view when there is a view', () => {
      const view = 'view'
      const state = reducers(initialState.setIn([view], 'test', true), clearNodes({ view }))
      assert.equal(state, initialState)
    })
    it('should remove view -> key when there is a view and key', () => {
      const view = 'view'
      const key = 'test'
      const state = reducers(initialState.setIn([view, key], 'test', true), clearNodes({ view, key }))
      assert.equal(state, initialState.setIn([view], Map()))
    })
  })
})
