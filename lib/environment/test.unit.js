import { describe, it } from 'mocha'
import { assert } from 'chai'
import { isIOS, isMobileSafari } from '.'

const UA_CHROME_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'
const UA_SAFARI_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/603.1.23 (KHTML, like Gecko) Version/10.0 Mobile/14E5239e Safari/602.1'
const UA_SAFARI_DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12'
const UA_CHROME_PHONE_ANDROID = 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19'
const UA_CHROME_TABLET_ANDROID = 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Safari/535.19'

describe('environment', () => {
  describe('Function: isIOS()', () => {
    it('should recognize iOS in Chrome for iOS', () => {
      const global = {
        navigator: {
          userAgent: UA_CHROME_IOS,
        },
      }
      assert.equal(true, isIOS({ global }), 'identified iOS in Chrome for iOS')
    })

    it('should recognize iOS in Mobile Safari', () => {
      const global = {
        navigator: {
          userAgent: UA_SAFARI_IOS,
        },
      }
      assert.equal(true, isIOS({ global }), 'identified iOS in Mobile Safari')
    })

    it('should recognize not iOS in Desktop Safari', () => {
      const global = {
        navigator: {
          userAgent: UA_SAFARI_DESKTOP,
        },
      }
      assert.equal(false, isIOS({ global }), 'identified not iOS in Desktop Safari')
    })

    it('should recognize not iOS in Chrome for Android Phone', () => {
      const global = {
        navigator: {
          userAgent: UA_CHROME_PHONE_ANDROID,
        },
      }
      assert.equal(false, isIOS({ global }), 'identified not iOS in Chrome for Android Phone')
    })

    it('should recognize not iOS in Chrome for Android Tablet', () => {
      const global = {
        navigator: {
          userAgent: UA_CHROME_TABLET_ANDROID,
        },
      }
      assert.equal(false, isIOS({ global }), 'identified not iOS in Chrome for Android Tablet')
    })

    it('should ignore OS if no browser detected', () => {
      assert.equal(false, isIOS(), 'identified not iOS if browser not detected')
    })
  })

  describe('Function: isMobileSafari()', () => {
    it('should return true for Mobile Safari User Agent', () => {
      const global = {
        navigator: {
          userAgent: UA_SAFARI_IOS,
        },
      }
      assert.equal(true, isMobileSafari({ global }), 'identified Mobile Safari')
    })

    it('should return false for Desktop Safari User Agent', () => {
      const global = {
        navigator: {
          userAgent: UA_SAFARI_DESKTOP,
        },
      }
      assert.equal(false, isMobileSafari({ global }), 'Desktop Safari is not Mobile Safari')
    })

    it('should return false for Chrome on iOS User Agent', () => {
      const global = {
        navigator: {
          userAgent: UA_CHROME_IOS,
        },
      }
      assert.equal(false, isMobileSafari({ global }), 'Chrome on iOS is not Mobile Safari')
    })

    it('should return false for Chrome on Android Phone User Agent', () => {
      const global = {
        navigator: {
          userAgent: UA_CHROME_PHONE_ANDROID,
        },
      }
      assert.equal(false, isMobileSafari({ global }), 'Chrome on Android Phone is not Mobile Safari')
    })

    it('should return false for Chrome on Android Tablet User Agent', () => {
      const global = {
        navigator: {
          userAgent: UA_CHROME_TABLET_ANDROID,
        },
      }
      assert.equal(false, isMobileSafari({ global }), 'Chrome on Android Tablet is not Mobile Safari')
    })
  })
})
