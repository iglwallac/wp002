import { assert } from 'chai'
import nock from 'nock'
import { get as getConfig } from 'config'
import { stringify as stringifyQuery } from 'query-string'
import { TYPE_BROOKLYN, REQUEST_ACCEPT_APPLICATION_JSON, REQUEST_TYPE_X_WWW_FORM_URLENCODED } from 'api-client'
import { get } from '.'

describe('service server-time', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  const config = getConfig()
  describe('Function: get()', () => {
    it('should successfull get the server time', async () => {
      const serverDate = new Date('2020-01-01T00:00:00')
      const serverTimeMs = serverDate.getTime()
      const serverTime = Math.floor(serverTimeMs / 1000)
      // The start of the day is just a time zone specific hour converted to a timestamp
      const serverDayStartDate = new Date('2020-01-01T06:00:00')
      const todayStart = Math.floor(serverDayStartDate.getTime() / 1000)
      // Give client date a 1 second drift
      const clientDate = new Date('2020-01-01T00:00:01')
      const clientTimeMs = clientDate.getTime()
      const clientTime = Math.floor(clientTimeMs / 1000)
      const timestampDiffMs = serverTimeMs - clientTimeMs
      const timestampDiff = Math.floor(timestampDiffMs / 1000)
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('accept', REQUEST_ACCEPT_APPLICATION_JSON)
        .matchHeader('content-type', REQUEST_TYPE_X_WWW_FORM_URLENCODED)
        .post('/v1/server-time', stringifyQuery({ clientTime: clientTimeMs }))
        .reply(200, {
          serverTime,
          serverTimeMs,
          todayStart,
        })
      const data = await get({ clientTimeMs })
      assert.isObject(data)
      assert.propertyVal(data, 'clientTime', clientTime)
      assert.propertyVal(data, 'clientTimeMs', clientTimeMs)
      assert.propertyVal(data, 'serverTime', serverTime)
      assert.propertyVal(data, 'serverTimeMs', serverTimeMs)
      assert.propertyVal(data, 'timestampDiff', timestampDiff)
      assert.propertyVal(data, 'timestampDiffMs', timestampDiffMs)
      assert.propertyVal(data, 'todayStart', todayStart)
      assert.isTrue(scope.isDone(), 'auth server time endpoint called')
    })
  })
})
