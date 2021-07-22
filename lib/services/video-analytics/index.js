import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import { log as logError } from 'log/error'
import { post as apiPost, TYPE_VA_SERVICE } from 'api-client'
import strictUriEncode from 'strict-uri-encode'

export const TYPE_DEFAULT = 'default'
export const TYPE_PREVIEW = 'preview'
export const TYPE_FEATURE = 'feature'

const SCHEMA_NODE_INFO = {
  offerings: [],
  isFree: false,
  georestrictions: {},
  drm: false,
  nodeId: null,
  title: '',
  nodeType: null,
  productType: null,
  thumbUrl: null,
  policyId: null,
  featureNid: null,
  previewNid: null,
  brightcoveId: null,
  mediaUrls: {},
  audioURL: '',
  tracks: {
    captions: {},
    subtitles: {},
  },
  runtime: 0,
  resumePosition: 0,
  ContentId: '',
  ReleaseDate: null,
  Studio: null,
  Copyright: null,
  OriginCountry: null,
  VideoLang: null,
  Instructor: null,
  Director: null,
  Producer: null,
  Writer: null,
  Cast: null,
  Series: null,
  Season: null,
  Episode: null,
  seriesNid: null,
  seriesSchedule: null,
  nextEpisodeNid: null,
  latestEpisodeNid: null,
}

export function createNodeInfoModel (video, userVideo, media, type) {
  const videoTypeData = video[type] ? video[type] : {}
  return _assign(_cloneDeep(SCHEMA_NODE_INFO), {
    offerings: videoTypeData.offerings ? videoTypeData.offerings : null,
    isFree: videoTypeData.isFree ? videoTypeData.isFree : null,
    georestrictions: videoTypeData.georestrictions
      ? videoTypeData.georestrictions
      : null,
    drm: videoTypeData.drm ? videoTypeData.drm : false,
    nodeId: type === TYPE_DEFAULT ? video.id : videoTypeData.id,
    title: type === TYPE_DEFAULT ? video.title : videoTypeData.contentId,
    nodeType: type === TYPE_DEFAULT ? video.cms_type : 'product_media',
    productType: type === TYPE_DEFAULT ? video.product_type : null,
    featureNid: type === TYPE_DEFAULT ? video.feature.id : null,
    previewNid: type === TYPE_DEFAULT ? video.preview.id : null,
    runtime: type !== TYPE_DEFAULT ? videoTypeData.duration : null,
    resumePosition:
      type !== TYPE_FEATURE && userVideo.featurePosition
        ? userVideo.featurePosition
        : 0,
    ContentId: type === TYPE_DEFAULT ? null : videoTypeData.contentId,
    Studio: type === TYPE_DEFAULT ? video.studio : null,
    Copyright: type === TYPE_DEFAULT ? video.copyright : null,
    OriginCountry: null,
    VideoLang: type === TYPE_DEFAULT ? video.videoLang : null,
    Instructor: type === TYPE_DEFAULT ? video.host : null,
    Director: type === TYPE_DEFAULT ? video.director : null,
    Producer: type === TYPE_DEFAULT ? video.producer : null,
    Writer: type === TYPE_DEFAULT ? video.writer : null,
    Cast: type === TYPE_DEFAULT ? video.cast : null,
    Series: type === TYPE_DEFAULT ? video.seriesTitle : null,
    Season: type === TYPE_DEFAULT ? video.season : null,
    Episode: type === TYPE_DEFAULT ? video.episode : null,
    seriesNid: type === TYPE_DEFAULT ? video.seriesId : null,
  })
}

/**
 * The first call to video analytics which creates a records
 * this media view
 */
export async function add (options) {
  const { id, data, auth } = options
  try {
    const res = await apiPost(`analytics/st/add/${strictUriEncode(id)}`, data, { auth }, TYPE_VA_SERVICE)
    return handleAddResponse(res, data)
  } catch (e) {
    return handleAddResponse({}, data)
  }
}

export function handleAddResponse (res, reqData) {
  const data = _get(res, 'body', {})
  const status = _parseInt(_get(data, 'status', -1))
  if (status !== 1 && status !== 2) {
    logError(
      `The video analytics response was not valid. Request: "${JSON.stringify(
        reqData,
      )}" Response: "${JSON.stringify(data)}"`,
    )
  }
  return data
}

/**
 * The first call to video analytics is an add call
 * then all other calls are update calls using data
 * from the add response
 */
export async function update (options) {
  const { stId, stToken, data, auth } = options
  try {
    const res = await apiPost(
      `analytics/st/upd/${strictUriEncode(stId)}/${strictUriEncode(stToken)}`,
      data,
      { auth },
      TYPE_VA_SERVICE,
    )
    return handleUpdateResponse(res, stId, stToken, data)
  } catch (e) {
    return handleUpdateResponse({}, stId, stToken, data, true)
  }
}

export function handleUpdateResponse (res) {
  return _get(res, 'body', {})
}
