import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  SET_USER_ACCOUNT_SUBSCRIPTION_MANAGE_TYPE,
  setUserAccountSubscriptionManageType,
  SET_USER_ACCOUNT_CANCEL_REASON,
  setUserAccountCancelReason,
  SET_USER_ACCOUNT_CANCEL_FORM_DATA,
  setUserAccountCancelFormData,
  RESET_USER_ACCOUNT_CANCEL_FORM_DATA,
  resetUserAccountCancelFormData,
  RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA,
  resetUserAccountManageSubscriptionData,
  SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA,
  setUserAccountCancelSubscriptionConfirmData,
  SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING,
  setUserAccountCancelSubscriptionConfirmProcessing,
  SET_USER_ACCOUNT_CANCEL_CONFIRM_ANSWER,
  setUserAccountCancelConfirmAnswer,
  SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS,
  setUserAccountDataBillingSubscriptions,
  SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
  setUserAccountDataBillingSubscriptionsWithDetails,
  SET_USER_ACCOUNT_PAUSE_LENGTH,
  setUserAccountPauseLength,
  clearUserAccountBillingSubscriptionsWithDetails,
  CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
  setUserAccountPauseData,
  SET_USER_ACCOUNT_PAUSE_DATA,
  setUserAccountPauseFormData,
  SET_USER_ACCOUNT_PAUSE_FORM_DATA,
  resetAccountChangePlanData,
  RESET_ACCOUNT_CHANGE_PLAN_DATA,
  setUserAccountSubscriptionPaymentsProcessing,
  SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING,
  setUserAccountSubscriptionPaymentsData,
  SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA,
  setUserAccountCancelOfferShown,
  UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN,
} from './actions'

describe('service user-account actions', () => {
  describe('Function: setUserAccountDataBillingSubscriptions()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserAccountDataBillingSubscriptions(data, processing),
      )
    })
  })
  describe('Function: setUserAccountDataBillingSubscriptionsWithDetails()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserAccountDataBillingSubscriptionsWithDetails(data, processing),
      )
    })
  })
  describe('Function: setUserAccountSubscriptionManageType()', () => {
    it('should create an action', () => {
      const value = 'cancel'
      const action = {
        type: SET_USER_ACCOUNT_SUBSCRIPTION_MANAGE_TYPE,
        payload: value,
      }
      assert.deepEqual(
        action,
        setUserAccountSubscriptionManageType(value),
      )
    })
  })
  describe('Function: setUserAccountCancelReason()', () => {
    it('should create an action', () => {
      const reason = 'dissatisfied'
      const action = {
        type: SET_USER_ACCOUNT_CANCEL_REASON,
        payload: reason,
      }
      assert.deepEqual(
        action,
        setUserAccountCancelReason(reason),
      )
    })
  })
  describe('Function: setUserAccountCancelFormData()', () => {
    it('should create an action', () => {
      const data = {
        version: '1.0',
        cancelReason: 'other',
        cancelReasonOtherAnswer: 'Dissatisfied with the content',
      }
      const action = {
        type: SET_USER_ACCOUNT_CANCEL_FORM_DATA,
        payload: data,
      }
      assert.deepEqual(
        action,
        setUserAccountCancelFormData(data),
      )
    })
  })
  describe('Function: resetUserAccountCancelFormData()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_USER_ACCOUNT_CANCEL_FORM_DATA,
      }
      assert.deepEqual(
        action,
        resetUserAccountCancelFormData(),
      )
    })
  })
  describe('Function: resetUserAccountManageSubscriptionData()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA,
      }
      assert.deepEqual(
        action,
        resetUserAccountManageSubscriptionData(),
      )
    })
  })
  describe('Function: clearUserAccountBillingSubscriptionsWithDetails()', () => {
    it('should create an action', () => {
      const action = {
        type: CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
      }
      assert.deepEqual(
        action,
        clearUserAccountBillingSubscriptionsWithDetails(),
      )
    })
  })
  describe('Function: setUserAccountCancelSubscriptionConfirmData()', () => {
    it('should create an action', () => {
      const data = {
        success: true,
        uuid: '1f2e5c8c-0dbe-11e8-b85e-7200002a6b80',
        subscriptionUuid: '3e4c1d48-0dbe-11e8-901c-7200002a6b80',
        start: '2017-02-09',
        create: '2017-02-09',
      }
      const processing = false
      const action = {
        type: SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserAccountCancelSubscriptionConfirmData(data),
      )
    })
  })
  describe('Function: setUserAccountCancelSubscriptionConfirmProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(action, setUserAccountCancelSubscriptionConfirmProcessing(processing))
    })
  })
  describe('Function: setUserAccountCancelConfirmAnswer()', () => {
    it('should create an action', () => {
      const answer = 'Some answer...'
      const action = {
        type: SET_USER_ACCOUNT_CANCEL_CONFIRM_ANSWER,
        payload: answer,
      }
      assert.deepEqual(action, setUserAccountCancelConfirmAnswer(answer))
    })
  })
  describe('Function: setUserAccountPauseLength()', () => {
    it('should create an action', () => {
      const value = 1
      const action = {
        type: SET_USER_ACCOUNT_PAUSE_LENGTH,
        payload: value,
      }
      assert.deepEqual(
        action,
        setUserAccountPauseLength(value),
      )
    })
  })
  describe('Function: setUserAccountPauseData()', () => {
    it('should create an action', () => {
      const data = {
        endDate: 1545762773600,
        startDate: 1540492373600,
      }
      const processing = false
      const action = {
        type: SET_USER_ACCOUNT_PAUSE_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserAccountPauseData(data),
      )
    })
  })
  describe('Function: setUserAccountPauseFormData()', () => {
    it('should create an action', () => {
      const data = {
        version: '1.0',
        pauseReason: 'other',
        pauseReasonOtherAnswer: 'Dissatisfied with the content',
      }
      const action = {
        type: SET_USER_ACCOUNT_PAUSE_FORM_DATA,
        payload: data,
      }
      assert.deepEqual(
        action,
        setUserAccountPauseFormData(data),
      )
    })
  })
  describe('Function: resetAccountChangePlanData()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_ACCOUNT_CHANGE_PLAN_DATA,
      }
      assert.deepEqual(
        action,
        resetAccountChangePlanData(),
      )
    })
  })
  describe('Function: setUserAccountSubscriptionPaymentsProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(action, setUserAccountSubscriptionPaymentsProcessing(processing))
    })
  })
  describe('Function: setUserAccountSubscriptionPaymentsData()', () => {
    it('should create an action', () => {
      const processing = false
      const data = {
        success: true,
        data: [
          {
            test: true,
          },
        ],
      }
      const action = {
        type: SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserAccountSubscriptionPaymentsData(data),
      )
    })
  })
  describe('Function: setUserAccountCancelOfferShown()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN,
        payload: value,
      }
      assert.deepEqual(
        action,
        setUserAccountCancelOfferShown(value),
      )
    })
  })
})
