import { describe, it } from 'mocha'
import { fromJS, Map } from 'immutable'
import { assert } from 'chai'
import td from 'testdouble'
import { createCurrentTime, getMediaLangParams, setPosition, getCurrentPosition } from './index'


const appLang = 'en'
// Users
const userEn = Map(fromJS({
  data: {
    language: ['en'],
  },
}))
const userEs = Map(fromJS({
  data: {
    language: ['es'],
  },
}))
// Media
const mediaEnNoSubtitles = Map(fromJS({
  data: {
    bcHLS: 'https://hls-stage-3jd84j.gaia.com/hls/132291/master.m3u8?expiration=1539295200&token=b1142df588c0eed3eddafc46bad9863c5758203dc554802332ded0bea8944334&bandwidth=200%2C8000',
    byLang: null,
    expiresTime: 1539285193574,
    id: 132291,
    textTracks: {
      captions: {
        en: 'https://texttracks.gaia.com/0e/b9/GTV-DS-S01-EP09-Aliens-And-Coverups-XD-cc-en-24592254.vtt',
      },
      subtitles: {},
    },
  },
  id: 132291,
  path: '/video/aliens-and-cover-ups',
}))
const mediaEnWithSubtitles = Map(fromJS({
  data: {
    bcHLS: 'https://hls.gaia.com/hls/166506/master.m3u8?expiration=1539205200&token=93467fd66880195a5db0acc13725c28e67d7198b7a13ba303abcd092f5d7d2f1',
    byLang: null,
    expiresTime: 1539285193574,
    id: 166506,
    textTracks: {
      captions: {
        en: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-cc-en-25288860.vtt',
      },
      subtitles: {
        de: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-st-de-25551170.vtt',
        es: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-st-es-25551090.vtt',
        fr: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-st-fr-25372330.vtt',
      },
    },
  },
  id: 166506,
  path: '/video/mathematical-codes-baalbek',
}))
const mediaEnEsWithSubtitles = Map(fromJS({
  data: {
    bcHLS: 'https://hls.gaia.com/hls/166506/master.m3u8?expiration=1539205200&token=93467fd66880195a5db0acc13725c28e67d7198b7a13ba303abcd092f5d7d2f1',
    byLang: {
      es: 'https://hls.gaia.com/hls/166506/master.m3u8?provider=es-bc-ak&expiration=1539205200&token=93467fd66880195a5db0acc13725c28e67d7198b7a13ba303abcd092f5d7d2f1',
    },
    expiresTime: 1539285193574,
    id: 166506,
    textTracks: {
      captions: {
        en: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-cc-en-25288860.vtt',
      },
      subtitles: {
        de: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-st-de-25551170.vtt',
        es: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-st-es-25551090.vtt',
        fr: 'https://texttracks.gaia.com/88/be/GTV-AC-S02-EP01-Mathematical-Codes-Of-Baalbek-XD-st-fr-25372330.vtt',
      },
    },
  },
  id: 166506,
  path: '/video/mathematical-codes-baalbek',
}))

describe('videojs', function () {
  describe('Function: createCurrentTime()', function () {
    it('should return 0 if start position is less then 60', function () {
      const duration = () => 100
      const player = { duration }
      const startPosition = 10
      assert.equal(createCurrentTime(startPosition, player), 0)
    })
    it('should return 0 if duration is greater then 0 and start position is great then duration minus 60', function () {
      const duration = () => 100
      const player = { duration }
      const startPosition = 60
      assert.equal(createCurrentTime(startPosition, player), 0)
    })
    it('should return start position minus 5', function () {
      const duration = () => 1000
      const player = { duration }
      const startPosition = 300
      assert.equal(createCurrentTime(startPosition, player), 295)
    })
  })
  describe('Function: setPosition()', function () {
    it('should call currentTime on player with value 100', function () {
      const currentTime = td.function()
      const player = { currentTime }
      const position = 100
      setPosition(position, player)
      td.verify(currentTime(position))
    })
  })
  describe('Function: getCurrentPosition()', function () {
    it('should get the floor value of the current position', function () {
      const time = 1000.05
      const currentTime = td.function()
      td.when(currentTime()).thenReturn(time)
      const player = { currentTime }
      const currentPositon = getCurrentPosition(player)
      assert.equal(currentPositon, Math.floor(time))
    })
  })
  describe('Function: getMediaLangParams()', () => {
    it('should return en media url and and no subtitles for en user', () => {
      const result = getMediaLangParams(userEn, mediaEnNoSubtitles)
      assert.equal(result.url, mediaEnNoSubtitles.getIn(['data', 'bcHLS']))
      assert.isNull(result.subtitles)
    })
    it('should return en url and es subtitles for en media for es user', () => {
      const result = getMediaLangParams(userEs, mediaEnWithSubtitles)
      assert.equal(result.url, mediaEnWithSubtitles.getIn(['data', 'bcHLS']))
      assert.equal(result.subtitles, 'es')
    })
    it('should return es url and no subtitles for es media for es user', () => {
      const result = getMediaLangParams(userEs, mediaEnEsWithSubtitles)
      assert.equal(result.url, mediaEnEsWithSubtitles.getIn(['data', 'byLang', 'es']))
      assert.isNull(result.subtitles)
    })
  })
})
