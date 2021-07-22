import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import {
  setTransaction,
  setRoute,
  setNewRelicLibrary,
  getNewRelicLibrary,
} from '.'

describe('new-relic-transaction', () => {
  describe('Function: setNewRelicLibrary()', () => {
    it('should set the NewRelic library', () => {
      const newrelic = {
        test: true,
      }
      setNewRelicLibrary(newrelic)
      assert.deepEqual(getNewRelicLibrary(), newrelic)
      setNewRelicLibrary(undefined)
    })
  })
  describe('Function: setTransaction()', () => {
    it('should set username, id and transaction to \'home\'', async () => {
      const setTransactionName = td.function()
      const addCustomAttribute = td.function()
      const username = 'test'
      const uid = 1234
      const pathname = '/'
      const newrelic = {
        addCustomAttribute,
        setTransactionName,
      }
      await setTransaction({ pathname, uid, username, newrelic })
      td.verify(setTransactionName('home'))
      td.verify(addCustomAttribute('username', username))
      td.verify(addCustomAttribute('uid', uid))
    })
  })
  describe('Function: setTransaction()', () => {
    it('should set username, id and transaction to \'member-home\'', () => {
      const setTransactionName = td.function()
      const addCustomAttribute = td.function()
      const username = 'test'
      const uid = 1234
      const pathname = '/'
      const authToken = 'TESTING_JWT'
      const newrelic = {
        addCustomAttribute,
        setTransactionName,
      }
      setTransaction({ pathname, uid, username, authToken, newrelic })
      td.verify(setTransactionName('member-home'))
      td.verify(addCustomAttribute('username', username))
      td.verify(addCustomAttribute('uid', uid))
    })
  })
  describe('Function: setTransaction()', () => {
    it('should set transaction to \'unknown\'', () => {
      const setTransactionName = td.function()
      const addCustomAttribute = td.function()
      const username = 'test'
      const uid = 1234
      const pathname = ''
      const authToken = 'TESTING_JWT'
      const newrelic = {
        addCustomAttribute,
        setTransactionName,
      }
      setTransaction({ pathname, uid, username, authToken, newrelic })
      td.verify(setTransactionName('unknown'))
    })
  })
  describe('Function: setRoute()', () => {
    it('should set username, id and transaction to \'home\'', () => {
      const setCurrentRouteName = td.function()
      const setCustomAttribute = td.function()
      const setPageViewName = td.function()
      const username = 'test'
      const uid = 1234
      const pathname = '/'
      const newrelic = {
        setCustomAttribute,
        setCurrentRouteName,
        setPageViewName,
      }
      setRoute({ pathname, uid, username, newrelic })
      td.verify(setCurrentRouteName('home'))
      td.verify(setPageViewName('home'))
      td.verify(setCustomAttribute('username', username))
      td.verify(setCustomAttribute('uid', uid))
    })
  })
  describe('Function: setRoute()', () => {
    it('should set username, id and transaction to \'member-home\'', () => {
      const setCurrentRouteName = td.function()
      const setCustomAttribute = td.function()
      const setPageViewName = td.function()
      const username = 'test'
      const uid = 1234
      const pathname = '/'
      const authToken = 'TESTING_JWT'
      const newrelic = {
        setCustomAttribute,
        setCurrentRouteName,
        setPageViewName,
      }
      setRoute({ pathname, uid, username, authToken, newrelic })
      td.verify(setCurrentRouteName('member-home'))
      td.verify(setPageViewName('member-home'))
      td.verify(setCustomAttribute('username', username))
      td.verify(setCustomAttribute('uid', uid))
    })
  })
  describe('Function: setRoute()', () => {
    it('should set transaction to \'unknown\'', () => {
      const setCurrentRouteName = td.function()
      const setCustomAttribute = td.function()
      const setPageViewName = td.function()
      const username = 'test'
      const uid = 1234
      const pathname = ''
      const authToken = 'TESTING_JWT'
      const newrelic = {
        setCustomAttribute,
        setCurrentRouteName,
        setPageViewName,
      }
      setRoute({ pathname, uid, username, authToken, newrelic })
      td.verify(setCurrentRouteName('unknown'))
      td.verify(setPageViewName('unknown'))
    })
  })
})
