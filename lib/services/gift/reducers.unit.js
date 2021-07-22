import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { List } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setGiftCheckoutStep,
  setGiftCheckoutStepComplete,
  setGiftCheckoutTheme,
  setGiftCheckoutGiverDataItem,
  setGiftCheckoutRecipientDataItem,
  setGiftCheckoutRecipientDateError,
  setGiftCheckoutRecipientSubscriptionStatusProcessing,
  setGiftCheckoutRecipientSubscriptionStatusData,
  setGiftCheckoutGiverPaymentType,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service gift reducers', () => {
  describe('Reducer SET_GIFT_CHEKOUT_STEP', () => {
    it('should set [\'step\', \'active\'] 1 in state', () => {
      const value = 1
      const state = reducers(
        initialState,
        setGiftCheckoutStep(value),
      )
      assert.equal(value, state.getIn(['step', 'active']))
    })
  })
  describe('Reducer SET_GIFT_CHEKOUT_STEP_COMPLETE', () => {
    it('should set [\'step\', \'complete\', 0] to 1 in state', () => {
      const value = 1
      const state = reducers(
        initialState,
        setGiftCheckoutStepComplete(value),
      )
      assert.equal(value, state.getIn(['step', 'complete', 0]))
    })
    it('should set [\'step\', \'complete\', 2] to 3 in state', () => {
      const value = 3
      const expected = List([1, 2, 3, 4, 5])
      const testState = initialState.setIn(
        ['step', 'complete'],
        List([1, 2, 3, 4, 5]),
      )
      const state = reducers(
        testState,
        setGiftCheckoutStepComplete(value),
      )
      assert.equal(expected, state.getIn(['step', 'complete']))
    })
  })
  describe('Reducer SET_GIFT_CHECKOUT_THEME', () => {
    it('should set [\'theme\', \'selected\'] testTheme in state', () => {
      const value = 'testTheme'
      const state = reducers(
        initialState,
        setGiftCheckoutTheme(value),
      )
      assert.equal(value, state.getIn(['theme', 'selected']))
    })
  })
  describe('Reducer SET_GIFT_CHECKOUT_GIVER_DATA_ITEM', () => {
    it('should set [\'data\', \'giver\', \'firstName\'] as Dan in state', () => {
      const key = 'firstName'
      const value = 'Dan'
      const state = reducers(
        initialState,
        setGiftCheckoutGiverDataItem(key, value),
      )
      assert.equal(value, state.getIn(['checkout', 'data', 'giver', key]))
    })
  })
  describe('Reducer SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM', () => {
    it('should set [\'data\', \'recipient\', \'firstName\'] as Don in state', () => {
      const key = 'firstName'
      const value = 'Don'
      const state = reducers(
        initialState,
        setGiftCheckoutRecipientDataItem(key, value),
      )
      assert.equal(value, state.getIn(['checkout', 'data', 'recipient', key]))
    })
  })
  describe('Reducer SET_GIFT_CHECKOUT_RECIPIENT_DATE_ERROR', () => {
    it('should set [\'data\', \'recipient\', \'dateError\'] as true in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setGiftCheckoutRecipientDateError(value),
      )
      assert.equal(value, state.getIn(['checkout', 'data', 'recipient', 'dateError']))
    })
  })
  describe('Reducer SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING', () => {
    it('should set [\'subscriptionStatusProcessing\'] as true in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setGiftCheckoutRecipientSubscriptionStatusProcessing(value),
      )
      assert.equal(value, state.get('subscriptionStatusProcessing'))
    })
  })
  describe('Reducer SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING', () => {
    it('should set [\'data\', \'recipient\', \'subscriptionStatus\'] in state', () => {
      const data = {
        activeSubscription: false,
        _dataError: undefined,
      }
      const processing = false

      const state = reducers(
        initialState,
        setGiftCheckoutRecipientSubscriptionStatusData(data, processing),
      )
      assert.equal(data.activeSubscription, state.getIn(['checkout', 'data', 'recipient', 'subscriptionStatus', 'activeSubscription']))
      assert.equal(processing, state.get('subscriptionStatusProcessing'))
    })
  })
  describe('Reducer SET_GIFT_CHECKOUT_GIVER_PAYMENT_TYPE', () => {
    it('should set [\'checkout\', \'data\', \'paymentType\'] creditCard in state', () => {
      const value = 'creditCard'
      const state = reducers(
        initialState,
        setGiftCheckoutGiverPaymentType(value),
      )
      assert.equal(value, state.getIn(['checkout', 'data', 'paymentType']))
    })
  })
})
