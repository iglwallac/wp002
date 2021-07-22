import { assert } from 'chai'
import _cloneDeep from 'lodash/cloneDeep'
import { getNextThreeSessions, hasFreeSession } from './'
import EVENT_DETAILS from './test/eventDetails.json'

const EVENT_DETAILS_LIVE = _cloneDeep(EVENT_DETAILS)
EVENT_DETAILS_LIVE.tracks[0].liveStreamActive = true
const SCHEDULE = _cloneDeep(EVENT_DETAILS.tracks[0].schedule)

describe('live-access-events', () => {
  describe('hasFreeSession()', () => {
    it('should return true', () => {
      const result = hasFreeSession(SCHEDULE)
      assert.equal(result, true)
    })
    it('should return false', () => {
      const CLONE = _cloneDeep(SCHEDULE)
      CLONE[0].isFree = false
      const result = hasFreeSession(CLONE)
      assert.equal(result, false)
    })
  })
  describe('getNextThreeSessions()', () => {
    describe('nowTs before first session', () => {
      const result = getNextThreeSessions(SCHEDULE, Date.parse('2019-08-16T14:02:00-06:00'))
      it('should return an array with three elements', () => {
        assert.equal(result.length, 3)
      })
      it('should return an array with first three sessions', () => {
        assert.equal(result[0], SCHEDULE[0])
        assert.equal(result[1], SCHEDULE[1])
        assert.equal(result[2], SCHEDULE[2])
      })
    })
    describe('nowTs before last session', () => {
      const result = getNextThreeSessions(SCHEDULE, Date.parse('2019-08-18T15:45:00-06:00'))
      it('should return an array with one element', () => {
        assert.equal(result.length, 1)
      })
      it('should return an array with the last session', () => {
        assert.equal(result[0], SCHEDULE[SCHEDULE.length - 1])
      })
    })
    describe('nowTs before session before last session', () => {
      const result = getNextThreeSessions(SCHEDULE, Date.parse('2019-08-18T14:30:00-06:00'))
      it('should return an array with two elements', () => {
        assert.equal(result.length, 2)
      })
      it('should return an array with the last two sessions', () => {
        assert.equal(result[0], SCHEDULE[SCHEDULE.length - 2])
        assert.equal(result[1], SCHEDULE[SCHEDULE.length - 1])
      })
    })
    describe('nowTs after last session', () => {
      const result = getNextThreeSessions(SCHEDULE, Date.parse('2019-08-18T18:02:00-06:00'))
      it('should return an empty array', () => {
        assert.isEmpty(result)
      })
    })
  })
})
