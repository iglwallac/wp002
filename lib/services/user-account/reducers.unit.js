import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS } from 'immutable'
import reducers, { initialState } from './reducers'
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
  SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
  setUserAccountBillingSubscriptionsProcessing,
  SET_USER_ACCOUNT_PAUSE_LENGTH,
  setUserAccountPauseLength,
  setUserAccountPauseFormData,
  SET_USER_ACCOUNT_PAUSE_FORM_DATA,
  resetAccountChangePlanData,
  RESET_ACCOUNT_CHANGE_PLAN_DATA,
  clearUserAccountBillingSubscriptionsWithDetails,
  CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
  setUserAccountSubscriptionPaymentsProcessing,
  SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING,
  setUserAccountSubscriptionPaymentsData,
  SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA,
  setUserAccountCancelOfferShown,
  UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service user-account reducers', () => {
  describe(`Reducer ${SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS}`, () => {
    it('should set data.billing.subscriptions and billingSubscriptionsProcessing in state', () => {
      const data = fromJS({
        subscriptions: [{ test: true }],
      })
      const processing = true
      const state = reducers(
        initialState,
        setUserAccountDataBillingSubscriptions(data, processing),
      )
      assert.equal(
        data.get('subscriptions'),
        state.getIn(['data', 'billing', 'subscriptions']),
      )
      assert.equal(processing, state.get('billingSubscriptionsProcessing'))
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS}`, () => {
    it('should set details.data.billing.subscriptions and billingSubscriptionsProcessing in state', () => {
      const data = fromJS({
        subscriptions: [{ test: true }],
      })
      const processing = true
      const state = reducers(
        initialState,
        setUserAccountDataBillingSubscriptionsWithDetails(data, processing),
      )
      assert.equal(
        data.get('subscriptions'),
        state.getIn(['details', 'data', 'billing', 'subscriptions']),
      )
      assert.equal(processing, state.get('billingSubscriptionsProcessing'))
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING}`, () => {
    it('should set billingSubscriptionsProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserAccountBillingSubscriptionsProcessing(value),
      )
      assert.equal(value, state.get('billingSubscriptionsProcessing'))
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_SUBSCRIPTION_MANAGE_TYPE}`, () => {
    it('should set type in state', () => {
      const value = 'cancel'
      const state = reducers(initialState, setUserAccountSubscriptionManageType(value))
      assert.equal(state.getIn(['manageSubscription', 'data', 'type']), value)
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_CANCEL_REASON}`, () => {
    it('should set cancelReason in state', () => {
      const value = 'dissatisfied'
      const state = reducers(initialState, setUserAccountCancelReason(value))
      assert.equal(state.getIn(['manageSubscription', 'data', 'cancelReason']), value)
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_CANCEL_FORM_DATA}`, () => {
    it('should set cancel data in state', () => {
      const data = fromJS({
        version: '1.0',
        cancelReason: 'other',
        cancelReasonOtherAnswer: 'Dissatisfied with the content',
      })
      const state = reducers(
        initialState,
        setUserAccountCancelFormData(data),
      )
      assert.equal(
        data,
        state.getIn(['manageSubscription', 'data', 'formData']),
      )
    })
  })
  describe(`Reducer ${RESET_USER_ACCOUNT_CANCEL_FORM_DATA}`, () => {
    it('should reset user account cancel form data in state', () => {
      const state = reducers(initialState, resetUserAccountCancelFormData())
      assert.equal(state.getIn(['manageSubscription', 'data', 'formData']), undefined)
    })
  })
  describe(`Reducer ${RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA}`, () => {
    it('should reset user account cancel data in state', () => {
      const state = reducers(initialState, resetUserAccountManageSubscriptionData())
      assert.equal(state.getIn(['manageSubscription', 'data']), undefined)
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA}`, () => {
    it('should set cancel confirm data in state', () => {
      const data = fromJS({
        success: true,
        uuid: '1f2e5c8c-0dbe-11e8-b85e-7200002a6b80',
        subscriptionUuid: '3e4c1d48-0dbe-11e8-901c-7200002a6b80',
        start: '2017-02-09',
        create: '2017-02-09',
      })
      const processing = false
      const state = reducers(
        initialState,
        setUserAccountCancelSubscriptionConfirmData(data),
      )
      assert.equal(
        data,
        state.getIn(['manageSubscription', 'data', 'cancelConfirmData']),
      )
      assert.equal(processing, state.getIn(['manageSubscription', 'data', 'cancelConfirmProcessing']))
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING}`, () => {
    it('should set setUserAccountCancelSubscriptionConfirmProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserAccountCancelSubscriptionConfirmProcessing(value),
      )
      assert.equal(value, state.getIn(['manageSubscription', 'data', 'cancelConfirmProcessing']))
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_CANCEL_CONFIRM_ANSWER}`, () => {
    it('should set setUserAccountCancelConfirmAnswer in state', () => {
      const value = 'Some answer...'
      const state = reducers(
        initialState,
        setUserAccountCancelConfirmAnswer(value),
      )
      assert.equal(value, state.getIn(['manageSubscription', 'data', 'cancelConfirmAnswer']))
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_PAUSE_LENGTH}`, () => {
    it('should set pauseLength in state', () => {
      const value = 1
      const state = reducers(initialState, setUserAccountPauseLength(value))
      assert.equal(state.getIn(['manageSubscription', 'data', 'pauseLength']), value)
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_PAUSE_FORM_DATA}`, () => {
    it('should set pause form data in state', () => {
      const data = fromJS({
        version: '1.0',
        cancelReason: 'other',
        cancelReasonOtherAnswer: 'Dissatisfied with the content',
      })
      const state = reducers(
        initialState,
        setUserAccountPauseFormData(data),
      )
      assert.equal(
        data,
        state.getIn(['manageSubscription', 'data', 'formData']),
      )
    })
  })
  describe(`Reducer ${RESET_ACCOUNT_CHANGE_PLAN_DATA}`, () => {
    it('should delete showPlanChanged in state', () => {
      const value = undefined
      const state = reducers(initialState, resetAccountChangePlanData())
      assert.equal(state.getIn(['data', 'billing', 'planChange']), value)
    })
  })
  describe(`Reducer ${CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS}`, () => {
    it('should delete UserAccountBillingSubscriptionsWithDetails in state', () => {
      const value = undefined
      const state = reducers(initialState, clearUserAccountBillingSubscriptionsWithDetails())
      assert.equal(state.getIn(['details']), value)
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING}`, () => {
    it('should set billingSubscriptionPaymentsProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserAccountSubscriptionPaymentsProcessing(value),
      )
      assert.equal(value, state.get('billingSubscriptionPaymentsProcessing'))
    })
  })
  describe(`Reducer ${SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA}`, () => {
    it('should set details.data.billing.payments in state', () => {
      const data = fromJS({
        success: true,
        data: [
          {
            test: true,
          },
        ],
      })
      const state = reducers(
        initialState,
        setUserAccountSubscriptionPaymentsData(data),
      )
      assert.equal(
        data,
        state.getIn(['details', 'data', 'billing', 'payments']),
      )
    })
  })
  describe(`Reducer ${UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN}`, () => {
    it('should set manageSubscription.data.offerShown in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserAccountCancelOfferShown(value),
      )
      assert.equal(value, state.getIn(['manageSubscription', 'data', 'offerShown']))
    })
  })
})
