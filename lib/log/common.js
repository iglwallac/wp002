/**
 * Common functions for the logger
 */
import { version } from './../../package.json'

const LOGGER_NAME = process.env.SERVICE_NAME || 'web-app'
const ENV = process.env.APP_ENV || process.env.NODE_ENV || 'local'

/**
 * Get the name for the logger
 */
export function getName () {
  return LOGGER_NAME
}

/**
 * Get the version for the logger
 */
export function getVersion () {
  return version
}

/**
 * Get the enviroment for the logger
 */
export function getEnv () {
  return ENV
}

export default {
  getName,
  getVersion,
  getEnv,
}
