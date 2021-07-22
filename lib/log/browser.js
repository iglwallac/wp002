/**
 * Logger to handler error message logging in the browser
 */
import { createLogger, ConsoleFormattedStream, ERROR, DEBUG } from 'browser-bunyan'
import { get as getConfig } from 'config'
import _get from 'lodash/get'
import NewRelicStream from 'bunyan-newrelic-stream/lib/browser'
import {
  getName,
  getVersion,
  getEnv,
} from './common'

/**
 * Get a logger for the browser
 */
export function getLogger () {
  const loggerConfig = {
    name: getName(),
    version: getVersion(),
    env: getEnv(),
    streams: [],
  }
  const { logLevel, logStdOut } = getConfig()

  loggerConfig.streams.push({
    level: ERROR,
    type: 'raw',
    stream: new NewRelicStream(),
  })

  if (_get(logStdOut, 'enabled')) {
    // For local and dev allow the browser to output the error to console.
    loggerConfig.streams.push({
      level: logLevel || DEBUG,
      stream: new ConsoleFormattedStream(),
    })
  }

  return createLogger(loggerConfig)
}

export default {
  getLogger,
}
