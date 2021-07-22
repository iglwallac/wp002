import { before, afterEach, describe, it } from 'mocha'
import _get from 'lodash/get'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { get as getConfig } from 'config'
import { getZuoraIframeSignatureToken } from './'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

const config = getConfig()

const signature = 'VpCAFL2hHC2irxbhWYGLJmdBigjARsCStwHZiQ78z5LyVuBCFr2lkie0db/7E8n38MXaq12Ng5As5Qj+9Nhz6RBsSEWLod7c7hvwNI28OcgBZtcV/wscbWU69EP/+/XrQnF3ZUbHbqmcmhE8C/zNnc2zvHckfArroDW2HxxmATfMJS0xKUm5TrHi4tiILZVMYY1KIUqQTyuXV6uRWYzkqMkFkZDNCxSxf0XwzuBI/VOgTCmFZb0c3+bk/q6+7d/azFCrrg8C3dquCNJRfUeaBou+SLUa4TW3hV4rGd2zpvSrD/425x4qFNGV6JQ7wvIleIdrXU4qbh9nCmYoApMODA=='
const pageId = '2c92c0f855e2b4630155ec9e6a1b6eec'
const success = true
const key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmWRFTwxQOqaG4JDZSQF/NJWvCDoSXm3TYilNzoN8nBbuvhKa7SZBBS+VP6rFqcbIU38Fu+Rf09vqyYOxuasPJe7yhqeOiStWB/aCPLhwXBeKt37L/qkwpNOKb1FETtUgrc+UjbtT0pnl55wCfi+Ik//X5SQi0B+c0ei1DQv99qmPJJErrhnBtdxeaWAT0EYAo42AOQ5cp0UWDY6OdOYL6+RyFOUFIs1yEgtfg4VMMSpSOKBOhYclQYuSC7nBF5Cc18ydtzsBpf7l49gCLTFzG45NCDAocada8KihFNpGXbauV9V4EPRD4lofaXdsXJ5Tw8/+KCsrUlvIQI3vcEv9LQIDAQAB'
const uri = 'https://apisandbox.zuora.com/apps/PublicHostedPageLite.do'
const tenantId = '12270'
const token = 'E2BJEle7YrAlw93SjkaKthTmzMvXF341'

const signatureTokenOptions = {
  pageId,
  uri,
}

const signatureTokenResponse = {
  signature,
  token,
  tenantId,
  key,
  success,
}

function createZuoraIframeSignatureTokenNock () {
  return nock(config.servers.brooklyn)
    .post('/v1/billing/iframe-init', signatureTokenOptions)
    .reply(200, signatureTokenResponse)
}

describe('services zuora', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  describe('Function: getZuoraIframeSignatureToken()', () => {
    it('should get zuora iframe signature token data', async () => {
      const scope = createZuoraIframeSignatureTokenNock()
      const data = await assert.isFulfilled(getZuoraIframeSignatureToken(signatureTokenOptions))
      assert.isTrue(scope.isDone(), 'brooklyn endpoint to get iframe signature token is called')
      assert.equal(success, _get(data, 'success'))
      assert.equal(token, _get(data, 'token'))
    })
  })
})
