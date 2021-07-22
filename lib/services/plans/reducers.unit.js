import { describe, it, before, after, afterEach } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import nock from 'nock'
import _isEqual from 'lodash/isEqual'
import { get as getConfig } from 'config'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  resetPlansData,
  RESET_PLANS_DATA,
  setPlansLocalizedProccesing,
  SET_PLANS_LOCALIZED_PROCESSING,
  setPlansData,
  SET_PLANS_DATA,
  setPlansSelection,
  SET_PLANS_SELECTION,
  setPlansProccesing,
  SET_PLANS_PROCESSING,
  setPlansError,
  SET_PLANS_ERROR,
  setPlansLocalizedSelection,
  SET_PLAN_CHANGE_SELECTED,
  setPlanChangeSelected,
} from './actions'
import PLANS_DATA from './test/plans-data.json'

chai.use(chaiImmutable)
const config = getConfig()
const { assert } = chai

describe('service plans reducers', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe(`Reducer ${RESET_PLANS_DATA}`, () => {
    it('should set state', () => {
      const testState = initialState.merge(
        Map({
          data: Map({ test: true }),
        }),
      )
      const state = reducers(testState, resetPlansData())
      assert.equal(state, initialState)
    })
  })
  describe(`Reducer ${SET_PLANS_LOCALIZED_PROCESSING}`, () => {
    it('should set state', () => {
      const processingLocalized = true
      const state = reducers(initialState, setPlansLocalizedProccesing(processingLocalized))
      const testState = initialState.merge(
        Map({
          processingLocalized,
        }),
      )
      assert.equal(state, testState)
    })
  })
  describe(`Reducer ${SET_PLANS_DATA}`, () => {
    it('should set state', () => {
      const processing = true
      const data = Map({ test: true })
      const state = reducers(initialState, setPlansData(data, processing))
      const testState = initialState.merge(
        Map({
          data,
          processing,
        }),
      )
      assert.equal(state, testState)
    })
  })
  describe(`Reducer ${SET_PLAN_CHANGE_SELECTED}`, () => {
    it('should set state', () => {
      const selectedPlan = 'test'
      const state = reducers(initialState, setPlanChangeSelected(selectedPlan))
      const testState = initialState.merge(
        Map({
          selectedPlan,
        }),
      )
      assert.equal(state.getIn(['changePlanData']), testState)
    })
  })
  describe(`Reducer ${SET_PLANS_SELECTION}`, () => {
    it('should set state', () => {
      const processingLocalized = true
      const selection = Map({ test: true })
      const state = reducers(initialState, setPlansSelection(selection, processingLocalized))
      const testState = initialState
        .merge(
          Map({
            selection,
            processingLocalized,
          }),
        )
        .delete('planError')
      assert.equal(state, testState)
    })
  })
  describe(`Reducer ${SET_PLANS_PROCESSING}`, () => {
    it('should set state', () => {
      const processing = true
      const state = reducers(initialState, setPlansProccesing(processing))
      const testState = initialState.merge(
        Map({
          processing,
        }),
      )
      assert.equal(state, testState)
    })
  })
  describe(`Reducer ${SET_PLANS_ERROR}`, () => {
    it('should set state', () => {
      const processingLocalized = true
      const planError = true
      const state = reducers(initialState, setPlansError(planError, processingLocalized))
      const testState = initialState.merge(
        Map({
          planError,
          processingLocalized,
        }),
      )
      assert.equal(state, testState)
    })
  })
  describe('Function: setPlansLocalizedSelection()', () => {
    it('should call the correct actions and plans brooklyn endpoint', (done) => {
      const sku = PLANS_DATA[0].sku
      const scope = nock(config.servers.brooklyn)
        .get('/v1/billing/plans')
        .query(query => _isEqual({ skus: [sku] }, query))
        .reply(200, PLANS_DATA)
      const thunk = setPlansLocalizedSelection({ sku })
      thunk((action) => {
        // TODO: Expand to check if reducers set correct state, not sure how.
        // Check that all the expected actions are called.
        assert.oneOf(action.type, [
          SET_PLANS_LOCALIZED_PROCESSING,
          SET_PLANS_SELECTION,
          SET_PLANS_ERROR,
        ])
      })
        .then(() => {
          // Check if the API call was made
          assert.isTrue(scope.isDone(), 'plans endpoint called')
          done()
        })
        .catch(done)
    })
  })
})
