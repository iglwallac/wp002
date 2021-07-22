import { before, afterEach, describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import { Map } from 'immutable'
import nock from 'nock'
import { get as getConfig } from 'config'
import { post } from './index'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

const config = getConfig()

const fakePostData = {
  formName: 'test',
  data: {
    version: '1.0',
  },
}

const fakeReturnData = {
  data: {
    uuid: 'fakeUuid',
  },
  _dataError: undefined,
}

function createPostFormSubmissionsNock () {
  return nock(config.servers.brooklyn)
    .post('/form-submissions', fakePostData)
    .reply(200, fakeReturnData)
}

describe('service form-submissions', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  describe('Function: post()', () => {
    it('should post form data to form-submissions endpoint', () => {
      const expected = fakeReturnData
      const scope = createPostFormSubmissionsNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })

      return assert.isFulfilled(post({ auth, data: fakePostData })
        .then((data) => {
          assert.isTrue(scope.isDone(), 'form-submissions endpoint is called.')
          assert.deepEqual(data, expected)
        }))
    })
  })
})
