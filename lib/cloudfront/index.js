/**
 * Wrapper around the AWS cloudfront library.
 * @module clodufront
 */
import AWS from 'aws-sdk'
import _assign from 'lodash/assign'
import bluebird from 'bluebird'

AWS.config.setPromisesDependency(bluebird)

/**
 * Default AWS cloudfront options
 */
const DEAULT_OPTIONS = { apiVersion: '2017-03-25' }

/**
 * instantiate aws cloudfront
 * @type {AWS}
 */
let cloudfront

export function init (options = {}) {
  cloudfront = new AWS.CloudFront(_assign({}, DEAULT_OPTIONS, options))
}

export function createInvalidation (params) {
  return cloudfront.createInvalidation(params).promise()
}

init()
