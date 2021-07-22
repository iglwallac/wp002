import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  setUserReferralData,
  SET_USER_REFERRAL_DATA,
  showInviteFriendPopup,
  SHOW_INVITE_FRIEND_POPUP,
  setInviteFriendTileData,
  SET_INVITE_FRIEND_TILES_DATA,
  setUserReferralDataProcessing,
  SET_USER_REFERRAL_DATA_PROCESSING,
  setUserReferralAttributionData,
  SET_USER_REFERRAL_ATTRIBUTION_DATA,
  setUserReferralAttributionDataProcessing,
  SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING,
} from './actions'

describe('service user referral actions', () => {
  describe('Function: setUserReferralData()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_USER_REFERRAL_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserReferralData({ data, processing }),
      )
    })
  })
  describe('Function: setUserReferralDataProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_REFERRAL_DATA_PROCESSING,
        payload: value,
      }
      assert.deepEqual(
        action,
        setUserReferralDataProcessing(value),
      )
    })
  })
  describe('Function: setUserReferralAttributionData()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_USER_REFERRAL_ATTRIBUTION_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserReferralAttributionData(data, processing),
      )
    })
  })
  describe('Function: setUserReferralAttributionDataProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING,
        payload: value,
      }
      assert.deepEqual(
        action,
        setUserReferralAttributionDataProcessing(value),
      )
    })
  })
  describe('Function: showInviteFriendPopup()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SHOW_INVITE_FRIEND_POPUP,
        payload: value,
      }
      assert.deepEqual(
        action,
        showInviteFriendPopup(value),
      )
    })
  })
  describe('Function: setInviteFriendTileData()', () => {
    it('should create an action', () => {
      const data = 'test'
      const action = {
        type: SET_INVITE_FRIEND_TILES_DATA,
        payload: { data },
      }
      assert.deepEqual(
        action,
        setInviteFriendTileData(data),
      )
    })
  })
})
