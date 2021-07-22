/**
 * Logger to handler error message logging on the server
 */
import { createLogger, ERROR, DEBUG } from 'bunyan'
import { get as getConfig } from 'config'
import _get from 'lodash/get'
import NewRelicStream from 'bunyan-newrelic-stream'
import {
  getName,
  getVersion,
  getEnv,
} from './common'

if (process.env.BROWSER) {
  throw new Error(
    'Cannot use the log module in the browser, please use require("log/browser") instead.',
  )
}
const ENV_LOCAL = !process.env.NODE_ENV || process.env.NODE_ENV === 'local'

/**
 * Get the stream for standard out, pretty printing locally.
 */
function getStdOutStream () {
  if (ENV_LOCAL) {
    // eslint-disable-next-line global-require
    const PrettyStream = require('bunyan-prettystream')
    const prettyStdOut = new PrettyStream()
    prettyStdOut.pipe(process.stdout)
    return prettyStdOut
  }
  return process.stdout
}

/**
 * Get a logger for the server
 */
export function getLogger () {
  const loggerConfig = {
    name: getName(),
    version: getVersion(),
    env: getEnv(),
    streams: [],
  }
  const { logLevelServer: logLevel, logStdOut } = getConfig()

  loggerConfig.streams.push({
    level: ERROR,
    type: 'raw',
    stream: new NewRelicStream(),
  })

  if (_get(logStdOut, 'serverEnabled')) {
    // Use standard out
    loggerConfig.streams.push({
      stream: getStdOutStream(),
      level: logLevel || DEBUG,
    })
  }

  const logger = createLogger(loggerConfig)
  return logger
}

export default {
  getLogger,
}
