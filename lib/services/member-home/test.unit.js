import { describe, it, before, after } from 'mocha'
import { assert } from 'chai'
import nock from 'nock'
import _size from 'lodash/size'
import _first from 'lodash/first'
import { createPayload } from './'

describe('service member-home', () => {
  before(() => {
    nock.disableNetConnect()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe('Function: createPayload()', () => {
    it('should remove missing empty items', () => {
      const nid = 1234
      const payloadTest = [{ nid }, false, undefined]
      const payload = createPayload(payloadTest)
      assert.equal(_size(payload), 1)
      assert.equal(_first(payload).id, nid)
    })
    it('should remove duplicate objects with the same id', () => {
      const nid = 1234
      const payloadTest = [{ nid }, { nid }, { nid }]
      const payload = createPayload(payloadTest)
      assert.equal(_size(payload), 1)
      assert.equal(_first(payload).id, nid)
    })
  })
})
