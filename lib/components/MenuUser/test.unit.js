import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import { USD, MXN } from 'services/currency'
import { canManageAccount } from './utils'

describe('web-app component UserMenu', () => {
  describe('Function: canManageAccount()', () => {
    it('should return true for an empty list', () => {
      const subscriptions = Map()
      assert.isTrue(canManageAccount(subscriptions))
    })
    it('should return true for one USD subcription', () => {
      const subscriptions = Map({ currencyIso: USD })
      assert.isTrue(canManageAccount(subscriptions))
    })
    it('should return false for one MXN subcription', () => {
      const subscriptions = Map({ currencyIso: MXN })
      assert.isFalse(canManageAccount(subscriptions))
    })
  })
})
