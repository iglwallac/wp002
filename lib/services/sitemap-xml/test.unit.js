import { describe, it, before, after, afterEach } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { get as getConfig } from 'config'
import { readFile } from 'fs'
import { promisify } from 'bluebird'
import { get } from '.'

const readFilePromisified = promisify(readFile)

const { assert } = chai.use(chaiAsPromised)
const config = getConfig()

describe('service sitemap-xml', () => {
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
    it('should fetch a sitemap', async () => {
      const sitemapFile = await readFilePromisified(`${__dirname}/test/sitemap.xml`)
      const sitemap = sitemapFile.toString()
      const scope = nock(config.servers.brooklyn)
        .matchHeader('Accept', 'application/xml')
        .matchHeader('Content-Type', 'application/xml')
        .get('/sitemap.xml')
        .reply(200, sitemap)
      const res = await assert.isFulfilled(get())
      assert.isTrue(scope.isDone(), 'endpoint was called')
      assert.equal(res.text, sitemap)
      assert.isTrue(scope.isDone(), 'endpoint was called')
    })
  })
})
