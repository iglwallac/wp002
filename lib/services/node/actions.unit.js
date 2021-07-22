import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import {
  dispatchSetNode,
  SET_NODES,
  clearNodes,
  REMOVE_NODES,
} from './actions'

describe('service node actions', () => {
  describe('Function: dispatchSetNode()', () => {
    it('should create an action', () => {
      const dispatch = td.function()
      const view = 'view'
      const key = 'test'
      const node = { test: true }
      dispatchSetNode(view, key, node, dispatch)
      td.verify(dispatch({ type: SET_NODES, payload: { view, key, node } }))
    })
  })
  describe('Function: clearNodes()', () => {
    it('should create an action', () => {
      const view = 'view'
      const key = 'get'
      const action = { type: REMOVE_NODES, payload: { key, view } }
      assert.deepEqual(clearNodes({ key, view }), action)
    })
  })
})
