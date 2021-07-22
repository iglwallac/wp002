/**
 * Server module main entry point.
 */
const newrelic = require('newrelic')

// Use the deprecated require.extensions api to fix import of .jsx files that don't end .jsx
require.extensions['.jsx'] = require.extensions['.js']

const { EventEmitter } = require('events')
const { setNewRelicLibrary } = require('./lib/new-relic-transaction')
const { version, name } = require('./package.json')
const assets = require('./webpack-assets.json')
const { run: runServer } = require('./lib/server')
const { readFile } = require('fs')
const { promisify, delay } = require('bluebird')
const _isEmpty = require('lodash/isEmpty')

EventEmitter.defaultMaxListeners = 1000
setNewRelicLibrary(newrelic)

const readFilePromisified = promisify(readFile)

async function start () {
  const data = await readFilePromisified(`${__dirname}/react-loadable.json`)
  const parsed = JSON.parse(data)
  if (_isEmpty(parsed)) {
    /* eslint-disable-next-line no-console */
    console.log('waiting for webpack to create react-loadables.json')
    await delay(1000)
    start()
    return
  }
  const loadables = await import('./react-loadable.json')
  runServer({ version, name, assets, loadables })
}

start()

