import { describe, it } from 'mocha'
import { fromJS, Map } from 'immutable'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import reducers, { initialState } from './reducers'
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

chai.use(chaiImmutable)
const { assert } = chai

describe('user referral reducers', () => {
  describe(`Reducer ${SET_USER_REFERRAL_DATA}`, () => {
    it('should set user referral data in state', () => {
      const data = Map({})
      const state = reducers(
        initialState,
        setUserReferralData({ data }),
      )
      assert.equal(data, state.get('data'))
    })
  })
  describe(`Reducer ${SET_USER_REFERRAL_DATA_PROCESSING}`, () => {
    it('should set user referral processing data in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserReferralDataProcessing(value),
      )
      assert.equal(value, state.get('processing'))
    })
  })
  describe(`Reducer ${SET_USER_REFERRAL_ATTRIBUTION_DATA}`, () => {
    it('should set user referral attribution data in state', () => {
      const data = Map({
        success: null,
        id: 0,
        processing: true,
      })
      const processing = true
      const state = reducers(
        initialState,
        setUserReferralAttributionData(data, processing),
      )
      assert.equal(data, state.get('attribution'))
    })
  })
  describe(`Reducer ${SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING}`, () => {
    it('should set user referral attribution processing data in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUserReferralAttributionDataProcessing(value),
      )
      assert.equal(value, state.getIn(['attribution', 'processing']))
    })
  })
  describe(`Reducer ${SHOW_INVITE_FRIEND_POPUP}`, () => {
    it('should set value key for showing the invte friend popup in state', () => {
      const value = true
      const state = reducers(
        initialState,
        showInviteFriendPopup(value),
      )
      assert.equal(value, state.getIn(['showInviteFriendPopup']))
    })
  })
  describe(`Reducer ${SET_INVITE_FRIEND_TILES_DATA}`, () => {
    it('should set tile data for the invite friend 8k grid', () => {
      const value = fromJS({
        data: [{ name: 'test' }],
      })
      const state = reducers(
        initialState,
        setInviteFriendTileData(value),
      )
      assert.equal(value, state.getIn(['inviteFriendTiles', 'data']))
    })
  })
})
