import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'

const _httpAgentOptions = {
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 30000,
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
}

/**
 * Http keep alive agent and pool
 */
const _keepaliveAgent = new Agent(_httpAgentOptions)

/**
 * Https keep alive agent and pool
 */
const _keepaliveHttpsAgent = new HttpsAgent(_httpAgentOptions)

let _jwt
let _error
let _idToken
let _response

export function getTestAuthUrl () {
  if (process.env.TEST_ENV === 'production') {
    return 'https://auth.gaia.com'
  }
  return 'https://auth-stage-ce6270.gaia.com'
}

export function getError () {
  return _error
}

export function getResponse () {
  return _response
}

export function getJwt () {
  return _jwt
}

export function getIdToken () {
  return _idToken
}

/**
 * Perform a form post to Drupal 6 that will login and return a JWT
 */
export async function doAuthLoginFormPost (endpoint, payload) {
  const uri = `${getTestAuthUrl()}${endpoint}`
  let request = superagent.agent(/^https:\/\//.test(uri) ? _keepaliveHttpsAgent : _keepaliveAgent)
  request = request.post(uri)
  request.set({
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  })
  request.type('json')
  if (payload) {
    request.send(payload)
  }
  _response = await request
  _jwt = _response.body.jwt
  _idToken = _response.body.idToken
  console.log(_jwt)
  return _response
}

export async function doAuthPost (endpoint, payload) {
  const uri = `${getTestAuthUrl()}${endpoint}`
  let request = superagent.agent(/^https:\/\//.test(uri) ? _keepaliveHttpsAgent : _keepaliveAgent)
  request = request.post(uri)
  request.set({
    Accept: 'application/json',
    Authorization: `Bearer ${_jwt}`,
    'Content-Type': 'application/json',
  })
  request.type('json')
  if (payload) {
    request.send(payload)
  }
  _response = await request
  // console.log(`jwt: ${_jwt}`)
  return _response
}
