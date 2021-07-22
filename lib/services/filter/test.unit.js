import { describe, it, before, after } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { List } from 'immutable'
import { get as getConfig } from 'config'
import { get, TYPE_YOGA_SPECIALITY } from './'
import specialityData from './test/speciality.json'

const { assert } = chai.use(chaiAsPromised)
const config = getConfig()

describe('services filter', () => {
  before(() => {
    nock.disableNetConnect()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe('Function: get()', () => {
    it('should should checkout options', async () => {
      await assert.isRejected(get(), 'The type options is required.')
    })
    it('should should fetch classic facet fields and return data', async () => {
      const scope = nock(config.servers.brooklyn)
        .matchHeader('accept', 'application/json')
        .get(`/fields/classic_facet/${TYPE_YOGA_SPECIALITY}`)
        .reply(200, specialityData)
      const data = await get({ type: TYPE_YOGA_SPECIALITY })
      assert.isTrue(
        List.isList(data.get('options')),
        'options are an immutable List',
      )
      assert.isAbove(
        data.get('options', List()).size,
        0,
        'size is greater then 0',
      )
      assert.isTrue(scope.isDone(), 'endpoint has been called')
    })
  })
})
