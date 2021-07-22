import { describe, it } from 'mocha'
import { assert } from 'chai'
import { getStaticPaths } from '.'

describe('routes', () => {
  describe('Function: getStaticPaths()', () => {
    it('should return a list of only static paths', () => {
      const routes = [
        { path: '/static', component: null },
        { path: '/:dyanmic-no-resolve', static: true, component: null },
        { path: '/:dyanmic', component: null },
        { path: '/:category/:subCategory', component: null },
      ]
      const result = getStaticPaths({ routes })
      const expected = [
        '/static',
        '/:dyanmic-no-resolve',
      ]
      assert.deepEqual(expected, result)
    })
  })
})
