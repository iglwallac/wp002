import { describe, it, afterEach } from 'mocha'
import td from 'testdouble'
import { Map, fromJS } from 'immutable'
import middleware from './middleware'

describe('service user middleware', () => {
  describe('Function: middleware()', () => {
    afterEach(() => {
      global.document = undefined
    })
    it('should call next with the action provided', () => {
      const getState = td.function()
      td.when(getState()).thenReturn({ user: Map() })
      const store = { getState }
      const action = { type: 'TEST', test: true }
      const next = td.function()
      middleware(store)(next)(action)
      td.verify(next(action))
    })
    it('should not error global.document is undefined', () => {
      const getState = td.function()
      td.when(getState()).thenReturn({ user: Map() })
      const store = { getState }
      const action = { type: 'TEST', test: true }
      const next = td.function()
      middleware(store)(next)(action)
      td.verify(next(action))
    })
    it('should not call gloabl.document.setAttribute(\'data-lang\') when the user language is equal', () => {
      const language = 'en'
      global.document = {
        documentElement: { getAttribute: td.function(), setAttribute: td.function() },
      }
      const getState = td.function()
      td.when(global.document.documentElement.getAttribute('data-lang')).thenReturn(language)
      td.when(getState()).thenReturn({
        user: fromJS({
          data: { language: [language] },
        }),
      })
      const store = { getState }
      const action = { type: 'TEST', test: true }
      const next = td.function()
      middleware(store)(next)(action)
      td.verify(next(action))
      td.verify(global.document.documentElement.setAttribute(), { ignoreExtraArgs: true, times: 0 }, 'global.document.documentElement.setAttribute() is not called')
    })
    it('should update the gloabl.document data-lang when user language is different', () => {
      const language = 'en'
      global.document = {
        documentElement: { getAttribute: td.function(), setAttribute: td.function() },
      }
      const getState = td.function()
      td.when(global.document.documentElement.getAttribute('data-lang')).thenReturn('')
      td.when(getState()).thenReturn({
        user: fromJS({
          data: { language: [language] },
        }),
      })
      const store = { getState }
      const action = { type: 'TEST', test: true }
      const next = td.function()
      middleware(store)(next)(action)
      td.verify(next(action))
      td.verify(
        global.document.documentElement.setAttribute('data-lang', language),
        { times: 1 },
        `global.document.documentElement.setAttribute() is called with ${language}`,
      )
    })
  })
})
