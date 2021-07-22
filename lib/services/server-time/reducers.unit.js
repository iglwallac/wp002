import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setServerTimeData,
  SET_SERVER_TIME_DATA,
  setServerTimeProcessing,
  SET_SERVER_TIME_PROCESSING,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service server-time reducers', () => {
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
  describe(`Reducer ${SET_SERVER_TIME_DATA}`, () => {
    it('should set data and processing in state', () => {
      const data = {
        clientTime,
        clientTimeMs,
        serverTime,
        serverTimeMs,
        timestampDiff,
        timestampDiffMs,
        todayStart,
      }
      const processing = false
      const state = reducers(
        initialState,
        setServerTimeData(data, processing),
      )
      assert.equal(
        state,
        Map({ processing, data: Map(data) }),
        'state matches expected',
      )
    })
  })
  describe(`Reducer ${SET_SERVER_TIME_PROCESSING}`, () => {
    it('should set processing in state', () => {
      const processing = true
      const state = reducers(
        initialState,
        setServerTimeProcessing(processing),
      )
      assert.equal(state.get('processing'), processing)
    })
  })
})
