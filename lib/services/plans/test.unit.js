import { describe, it, before, after, afterEach } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import {
  List,
  fromJS,
} from 'immutable'
import _get from 'lodash/get'
import _forEach from 'lodash/forEach'
import _isEqual from 'lodash/isEqual'
import nock from 'nock'
import { USD, EUR } from 'services/currency'
import { get as getConfig } from 'config'
import {
  getPlansLocalized,
  getPlans,
  renderPlanTemplate,
  getNextPriceFromPlan,
} from './'
import LANG_EN_DATA from './lang_en.json'
import LANG_ES_DATA from './lang_es-LA.json'
import PLANS_DATA from './test/plans-data.json'

chai.use(chaiImmutable).use(chaiAsPromised)
const { assert } = chai

const config = getConfig()

describe('service plans', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe('Function: getPlansLocalized()', () => {
    it('should reject with an error is no skus are provided', async () => {
      await assert.isRejected(getPlansLocalized({}))
    })
    it('should get plan data from zuora brooklyn api', async () => {
      const sku = PLANS_DATA[0].sku
      const scope = nock(config.servers.brooklyn)
        .get('/v1/billing/plans')
        .query(query => _isEqual({ skus: [sku] }, query))
        .reply(200, PLANS_DATA)
      const data = await getPlansLocalized({ skus: List([sku]) })
      assert.isTrue(scope.isDone(), 'endpoint was called')
      assert.equal(sku, data.getIn(['plans', 0, 'sku']))
    })
  })
  describe('Function: getPlans()', () => {
    it('should get plans in english', async () => {
      const data = await getPlans()
      const plans = _get(LANG_EN_DATA, 'plans', [])
      _forEach(plans, (plan, index) =>
        assert.equal(
          _get(plan, 'sku'),
          data.getIn(['plans', index, 'sku']),
        ),
      )
    })
    it('should get plans in spanish', async () => {
      const data = await getPlans({ language: 'es' })
      const plans = _get(LANG_ES_DATA, 'plans', [])
      _forEach(plans, (plan, index) =>
        assert.equal(
          _get(plan, 'sku'),
          data.getIn(['plans', index, 'sku']),
        ),
      )
    })
  })
  describe('Function: renderPlanTemplate()', () => {
    it('should replace plan template currency', () => {
      const plan = fromJS({
        currencyIso: USD,
        currencySymbol: '$',
        costs: ['0.99', '20.00'],
      })
      const template =
        // eslint-disable-next-line no-template-curly-in-string
        '${ currencySymbol }${ costs[0] } ${ currencyIso } for 3 Months, Monthly'
      const template1 =
        // eslint-disable-next-line no-template-curly-in-string
        'payment of ${ currencySymbol }${ costs[1] } ${ currencyIso } thereafter'
      assert.equal(
        '$0.99 USD for 3 Months, Monthly',
        renderPlanTemplate(plan, template),
      )
      assert.equal(
        'payment of $20.00 USD thereafter',
        renderPlanTemplate(plan, template1),
      )
    })
  })

  describe('Function: getNextPriceFromPlan()', () => {
    it('should format the next price in USD', () => {
      const plan = fromJS({
        currencyIso: USD,
        currencySymbol: '$',
        segments: [
          {
            price: '10.00',
            currencyIso: USD,
          },
          {
            price: '100.00',
            currencyIso: USD,
          },
        ],
      })

      assert.equal(getNextPriceFromPlan(plan), '$100')
    })

    it('should format the next price in EUR', () => {
      const plan = fromJS({
        currencyIso: EUR,
        currencySymbol: '€',
        segments: [
          {
            price: '10.00',
            currencyIso: EUR,
          },
          {
            price: '100.00',
            currencyIso: EUR,
          },
        ],
      })

      assert.equal(getNextPriceFromPlan(plan), '100 €')
    })

    it('should return N/A if the next price does not exist', () => {
      const plan = fromJS({
        currencyIso: USD,
        currencySymbol: '$',
        segments: [
          {
            price: '10.00',
            currencyIso: USD,
          },
        ],
      })

      assert.equal(getNextPriceFromPlan(plan), 'N/A')
    })

    it('should return null without passing a plan as a parameter', () => {
      assert.isNull(getNextPriceFromPlan())
    })
  })
})
