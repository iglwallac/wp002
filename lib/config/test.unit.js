import { describe, it } from 'mocha'
import { assert } from 'chai'
import _join from 'lodash/join'
import {
  parseEnvArray,
  parseEnvBool,
  parseEnvInt,
  parseEnvFloat,
} from './index'

describe('config', () => {
  describe('Function: parseEnvArray()', () => {
    it('should parse an environment variable into an array', () => {
      const values = ['1', '2', '3', '4', '5']
      const envValue = _join(values, ',')
      assert.deepEqual(values, parseEnvArray(envValue, []))
    })
    it('should use the default when the env is undefined', () => {
      const values = ['1', '2', '3', '4', '5']
      assert.deepEqual(values, parseEnvArray(undefined, values))
    })
    it('should parse an environment variable into an array using a | delimiter', () => {
      const values = ['1', '2', '3', '4', '5']
      const delimiter = '|'
      const envValue = _join(values, delimiter)
      assert.deepEqual(values, parseEnvArray(envValue, [], delimiter))
    })
  })
  describe('Function: parseEnvBool()', () => {
    it('should parse an environment variable into a boolean', () => {
      assert.equal(1, parseEnvBool('1', 0))
    })
    it('should use the default when the env is undefined', () => {
      assert.equal(0, parseEnvBool(undefined, 0))
    })
  })
  describe('Function: parseEnvInt()', () => {
    it('should parse an environment variable into an integer', () => {
      assert.equal(10, parseEnvInt('10', 0))
    })
    it('should use the default when the env is undefined', () => {
      assert.equal(20, parseEnvInt(undefined, 20))
    })
  })
  describe('Function: parseEnvFloat()', () => {
    it('should parse an environment variable into a float', () => {
      assert.equal(10.2, parseEnvFloat('10.2', 0))
    })
    it('should use the default when the env is undefined', () => {
      assert.equal(20.1, parseEnvInt(undefined, 20.1))
    })
  })
})
