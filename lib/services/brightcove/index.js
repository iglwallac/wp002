/**
 * Brightcove features
 */

export const BRIGHTCOVE_STREAM_PATH = 'https://secure.brightcove.com/services/mobile/streaming/index/master.m3u8'

/**
 * Create a player src url for use in a brightcove player with a direct url reference
 * @param {Number} accountId The brightcove account id
 * @param {Number} videoId The brightcove video id
 * @returns {String} The brightcove player source url
 */
export function createPlayerSrc (accountId, videoId) {
  if (!accountId) {
    throw new Error('The accountId argument is required')
  }
  if (!videoId) {
    throw new Error('The videoId argument is required')
  }
  return `${BRIGHTCOVE_STREAM_PATH}?videoId=${videoId}&pubId=${accountId}&secure=true`
}
