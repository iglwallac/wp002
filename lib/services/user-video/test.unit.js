import { describe, it, before, after, afterEach } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import _parseInt from 'lodash/parseInt'
import nock from 'nock'
import { get as getConfig } from 'config'
import {
  get,
} from './'
import USER_NODE_DRUPAL_6_DATA from './test/user-node-drupal-6.json'

chai.use(chaiImmutable)
const { assert } = chai

const config = getConfig()

export function createUserNodeDrupal6Nock ({ id, auth }) {
  return nock(config.servers.brooklyn)
    .matchHeader('accept', 'application/json')
    .matchHeader('authorization', `Bearer ${auth}`)
    .get(`/user/node/${id}`)
    .reply(200, USER_NODE_DRUPAL_6_DATA)
}

describe('service user-video', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe('Function: get()', () => {
    it('should get user node data', async () => {
      const id = 123
      const auth = 'TEST_JWT'
      const scope = createUserNodeDrupal6Nock({ id, auth })
      const data = await get({ id, auth })
      assert.deepEqual({
        id,
        _dataError: undefined,
        featurePosition: _parseInt(USER_NODE_DRUPAL_6_DATA.featurePosition),
        playlist: USER_NODE_DRUPAL_6_DATA.playlist,
      }, data)
      scope.isDone()
    })
  })
})


export default {
  createUserNodeDrupal6Nock,
}
