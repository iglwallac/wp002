import { getLogger as getLoggerServer } from 'log/server'
import { getSetLogger } from 'log'
import { run as runServer } from './../server'

function run ({ loadables, assets, version, name }) {
  const log = getSetLogger(getLoggerServer())
  function onUncaughtException (e) {
    log.fatal(e)
    removeListeners()
  }

  /**
   * Log promise rejections which are not caught properly
   */
  function onUnhandledRejection (reason) {
    log.error(reason)
  }

  function removeListeners () {
    process.removeListener('uncaughtException', onUncaughtException)
    process.removeListener('unhandledRejection', onUnhandledRejection)
    process.removeListener('SIGTERM', removeListeners)
    process.removeListener('SIGINT', removeListeners)
    log.info('Web App Server Removed Process Listeners')
  }

  function setListeners () {
    process.on('unhandledRejection', onUnhandledRejection)
    process.on('uncaughtException', onUncaughtException)
    // listen for TERM signal .e.g. kill
    process.on('SIGTERM', removeListeners)
    // listen for INT signal e.g. Ctrl-C
    process.on('SIGINT', removeListeners)
    log.info('Web App Server Created Process Listeners')
  }

  setListeners()
  return runServer({ loadables, assets, version, name, log })
}

export default {
  run,
}
