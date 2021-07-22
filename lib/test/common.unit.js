import { describe, it } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import fs from 'fs'
import { resolve as resolvePath } from 'path'
import { glob } from 'multi-glob'
import { promisify, promisifyAll, each as eachPromise } from 'bluebird'
import _concat from 'lodash/concat'
import _includes from 'lodash/includes'
import _filter from 'lodash/filter'
import _reduce from 'lodash/reduce'
import _trim from 'lodash/trim'
import _join from 'lodash/join'
import _toString from 'lodash/toString'
import _split from 'lodash/split'
import _slice from 'lodash/slice'
import _size from 'lodash/size'

const { assert } = chai.use(chaiAsPromised)
const COMPONENTS_PATH = '/components/'
const globPromisified = promisify(glob)
const { readFileAsync, statAsync } = promisifyAll(fs)

function createPathIndexFile (path) {
  const pathSegments = _split(path, '/')
  const dir = _slice(pathSegments, 0, _size(pathSegments) - 1)
  return _join(_concat(dir, 'index.js'), '/')
}

describe('common', () => {
  describe('components and services folder structure', () => {
    it('index.js exists and is well formed', async () => {
      const basePath = resolvePath(__dirname, './..')
      const files = await globPromisified(
        [`${basePath}/services/**/*.js`, `${basePath}${COMPONENTS_PATH}**/*.js`],
        { strict: true },
      )
      const indexFiles = _reduce(files, (acc, path) => {
        const indexFile = createPathIndexFile(path)
        if (!_includes(acc, indexFile)) {
          return _concat(acc, indexFile)
        }
        return acc
      }, [])
      // Run stat on all index files to make sure they exist,
      // stat will throw if they do not
      await eachPromise(indexFiles, async (indexFile) => {
        await assert.isFulfilled(statAsync(indexFile), `the index file ${indexFile} exists`)
      })
      // Just checkout component index files for syntax
      const componentIndexFiles = _filter(indexFiles, path => path.includes(COMPONENTS_PATH))
      await eachPromise(componentIndexFiles, async (componentIndexFile) => {
        const file = await assert.isFulfilled(
          readFileAsync(componentIndexFile),
          `the component file ${componentIndexFile} exists`,
        )
        const contents = _trim(_toString(file))
        assert.match(
          contents,
          /export (default [a-zA-Z]+|\* from '[a-zA-Z.]+')/,
          `${componentIndexFile} has a well-formed component export default or * statement`,
        )
      })
    })
  })
})
