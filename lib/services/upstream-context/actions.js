export const SET_UPSTREAM_CONTEXT = 'SET_UPSTREAM_CONTEXT'
export const CLEAR_UPSTREAM_CONTEXT = 'CLEAR_UPSTREAM_CONTEXT'
/**
  * - We are hitting the /v2/events/track endpoint in core api, which has a
  *   'gaiaContext' schema
  *
  *  scrubbedPayload should conform to:
      const gaiaContextSchema = joi.object().keys({
        contextType: joi.string().required(),
        videoId: joi.number().integer().min(1),
        seriesId: joi.number().integer().min(1),
        termId: joi.number().integer().min(1),
        destId: joi.number().integer().min(1),
        rowType: joi.string(),
        rowIndex: joi.number().integer(),
        itemIndex: joi.number().integer(),
        sort: joi.string()
      })
  *
  *  @param {Map} data
*/
function scrubPayload (data) {
  let scrubbedPayload = data

  scrubbedPayload = scrubbedPayload.get('destId') < 1
    ? scrubbedPayload.remove('destId')
    : scrubbedPayload

  return scrubbedPayload
}

export function setUpstreamContext (data) {
  const payload = scrubPayload(data)
  return {
    type: SET_UPSTREAM_CONTEXT,
    payload,
  }
}

export function clearUpstreamContext () {
  return {
    type: CLEAR_UPSTREAM_CONTEXT,
  }
}
