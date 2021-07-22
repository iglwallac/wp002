import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  setGiftCheckoutStep,
  SET_GIFT_CHEKOUT_STEP,
  setGiftCheckoutStepComplete,
  SET_GIFT_CHEKOUT_STEP_COMPLETE,
  setGiftCheckoutTheme,
  SET_GIFT_CHECKOUT_THEME,
  setGiftCheckoutGiverDataItem,
  SET_GIFT_CHECKOUT_GIVER_DATA_ITEM,
  setGiftCheckoutRecipientDataItem,
  SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM,
  setGiftCheckoutRecipientDateError,
  SET_GIFT_CHECKOUT_RECIPIENT_DATE_ERROR,
  setGiftCheckoutRecipientSubscriptionStatusProcessing,
  SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING,
  getGiftCheckoutRecipientSubscriptionStatus,
  GET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS,
  setGiftCheckoutRecipientSubscriptionStatusData,
  SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_DATA,
  setGiftCheckoutGiverPaymentType,
  SET_GIFT_CHECKOUT_GIVER_PAYMENT_TYPE,
} from './actions'

describe('service gift actions', () => {
  describe('Function: setGiftCheckoutStep()', () => {
    it('should create an action', () => {
      const value = 1
      const action = {
        type: SET_GIFT_CHEKOUT_STEP,
        payload: value,
      }
      assert.deepEqual(action, setGiftCheckoutStep(value))
    })
  })
  describe('Function: setGiftCheckoutStepComplete()', () => {
    it('should create an action', () => {
      const value = 1
      const action = {
        type: SET_GIFT_CHEKOUT_STEP_COMPLETE,
        payload: value,
      }
      assert.deepEqual(action, setGiftCheckoutStepComplete(value))
    })
  })
  describe('Function: setGiftCheckoutTheme()', () => {
    it('should create an action', () => {
      const value = 'testTheme'
      const action = {
        type: SET_GIFT_CHECKOUT_THEME,
        payload: value,
      }
      assert.deepEqual(action, setGiftCheckoutTheme(value))
    })
  })
  describe('Function: setGiftCheckoutGiverDataItem()', () => {
    it('should create an action', () => {
      const key = 'firstName'
      const value = 'Dan'
      const action = {
        type: SET_GIFT_CHECKOUT_GIVER_DATA_ITEM,
        payload: { key, value },
      }
      assert.deepEqual(action, setGiftCheckoutGiverDataItem(key, value))
    })
  })
  describe('Function: setGiftCheckoutRecipientDataItem()', () => {
    it('should create an action', () => {
      const key = 'firstName'
      const value = 'Don'
      const action = {
        type: SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM,
        payload: { key, value },
      }
      assert.deepEqual(action, setGiftCheckoutRecipientDataItem(key, value))
    })
  })
  describe('Function: setGiftCheckoutRecipientDateError()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_GIFT_CHECKOUT_RECIPIENT_DATE_ERROR,
        payload: value,
      }
      assert.deepEqual(action, setGiftCheckoutRecipientDateError(value))
    })
  })
  describe('Function: setGiftCheckoutRecipientSubscriptionStatusProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING,
        payload: value,
      }
      assert.deepEqual(action, setGiftCheckoutRecipientSubscriptionStatusProcessing(value))
    })
  })
  describe('Function: getGiftCheckoutRecipientSubscriptionStatus()', () => {
    it('should create an action', () => {
      const email = 'dan@example.com'
      const action = {
        type: GET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS,
        payload: email,
      }
      assert.deepEqual(action, getGiftCheckoutRecipientSubscriptionStatus(email))
    })
  })
  describe('Function: setGiftCheckoutRecipientSubscriptionStatusData()', () => {
    it('should create an action', () => {
      const processing = false
      const data = {
        activeSubscription: false,
        _dataError: undefined,
      }

      const action = {
        type: SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(action, setGiftCheckoutRecipientSubscriptionStatusData(data, processing))
    })
  })
  describe('Function: setGiftCheckoutGiverPaymentType()', () => {
    it('should create an action', () => {
      const value = 'creditCard'
      const action = {
        type: SET_GIFT_CHECKOUT_GIVER_PAYMENT_TYPE,
        payload: value,
      }
      assert.deepEqual(action, setGiftCheckoutGiverPaymentType(value))
    })
  })
})
