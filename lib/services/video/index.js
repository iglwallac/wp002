import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _size from 'lodash/size'
import _parseInt from 'lodash/parseInt'
import _keys from 'lodash/keys'
import {
  getRealContentType,
  getRealDisplayType,
  getRealProductType,
  getContentType,
  getProductType,
  TYPE_CMS_NODE,
} from 'services/content-type'
import { getGeoAvailabilityCode } from 'services/geo-restrictions'
import {
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE,
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
} from 'services/subscription'

// controls how many milliseconds to minimize controls when user stops moving mouse
export const VIDEO_PLAYER_INACTIVITY_TIMEOUT = 1000
export const MOBILE_VIDEO_PLAYER_INACTIVITY_TIMEOUT = 10000

const SCHEMA = {
  id: null,
  _dataError: null,
  type: {
    content: null,
    product: null,
  },
  title: null,
  description: null,
  host: null,
  season: null,
  episode: null,
  studio: null,
  copyright: null,
  videoLang: null,
  director: null,
  producer: null,
  writer: null,
  cast: null,
  vote: 0,
  voteDown: 0,
  seriesTitle: null,
  seriesId: null,
  poster: null,
  path: null,
  cms_type: null,
  product_type: null,
  commentTotalCount: 0,
  admin_category: {
    tid: null,
    vid: null,
    name: null,
    weight: null,
  },
  preview: {
    id: null,
    offerings: {
      availability: null,
      subscriptions: [],
    },
    georestrictions: {
      availability: null,
      countries: [],
    },
    duration: 0,
  },
  feature: {
    id: null,
    offerings: {
      availability: null,
      subscriptions: [],
    },
    georestrictions: {
      availability: null,
      countries: [],
    },
    duration: 0,
  },
  siteSegment: {
    id: -1,
    name: null,
  },
}

export const TYPE_PREVIEW = 'preview'
export const TYPE_FEATURE = 'feature'
export const CONSUMER_TYPE_WEBAPP = 'webapp'

export async function get (options) {
  const { id, xff, language } = options
  try {
    const res = await apiGet(`node/${id}`, { language }, { xff }, TYPE_BROOKLYN)
    return handleResponse(res)
  } catch (e) {
    return createModel({}, true)
  }
}

export function handleResponse (res) {
  const data = _get(res, 'body', {})
  return createModel(data)
}

function createModel (data, _dataError) {
  const season = _get(data, 'fields.season[0].value', null)
  const episode = _get(data, 'fields.episode[0].value', null)
  // Preview Availibility
  const preivewIsFree = _get(data, 'preview.isFree', false)
  const previewSubscriptions = _get(data, 'preview.offerings', [])
  const previewAvailibility =
    preivewIsFree || _size(previewSubscriptions) === 0
      ? SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE
      : SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH
  // Feature Availibility
  const featureIsFree = _get(data, 'feature.isFree', false)
  const featureSubscriptions = _get(data, 'feature.offerings', [])
  const featureAvailibility =
    featureIsFree || _size(featureSubscriptions) === 0
      ? SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE
      : SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH

  return _assign(_cloneDeep(SCHEMA), {
    id: _parseInt(_get(data, 'nid', -1)),
    _dataError,
    // Use these simple types:
    contentType: getRealContentType(data),
    productType: getRealDisplayType(data),
    displayType: getRealProductType(data),
    // Stop using this legacy type map:
    type: {
      content: getContentType(TYPE_CMS_NODE, data),
      product: getProductType(TYPE_CMS_NODE, data),
    },
    title: _get(data, 'title'),
    description: _get(data, 'fields.body[0].value'),
    host: _get(data, 'fields.instructor[0].value'),
    season: typeof season !== 'undefined' ? _parseInt(season) : null,
    episode: typeof episode !== 'undefined' ? _parseInt(episode) : null,
    studio: _get(data, 'fields.studio[0].value'),
    copyright: _get(data, 'fields.copyright[0].value'),
    videoLang: _get(data, 'fields.video_lang[0].value'),
    director: _get(data, 'fields.director[0].value'),
    producer: _get(data, 'fields.producer[0].value'),
    writer: _get(data, 'fields.writer[0].value'),
    cast: _get(data, 'fields.cast[0].value'),
    vote: _parseInt(_get(data, 'fivestar.up_count.value')),
    voteDown: _parseInt(_get(data, 'fivestar.down_count.value')),
    seriesTitle: _get(data, 'series.title', ''),
    seriesId: data.series ? _parseInt(_get(data, 'series.nid', -1)) : null,
    poster: _get(data, 'keyart_16x9_notext.keyart_570x321'),
    path: _get(data, 'path'),
    cms_type: _get(data, 'type'),
    product_type: _get(data, 'product_type'),
    commentTotalCount: _parseInt(_get(data, 'comment_count', 0)),
    admin_category: {
      tid: _get(data, 'admin_category.tid')
        ? _parseInt(_get(data, 'admin_category.tid'))
        : null,
      vid: _get(data, 'admin_category.vid')
        ? _parseInt(_get(data, 'admin_category.vid'))
        : null,
      name: _get(data, 'admin_category.name'),
      weight: _get(data, 'admin_category.weight')
        ? _parseInt(_get(data, 'admin_category.weight'))
        : null,
    },
    preview: {
      id: _parseInt(_get(data, 'preview.nid', -1)),
      contentId: _get(data, 'feature.contentId'),
      offerings: {
        availability: previewAvailibility,
        subscriptions: _get(data, 'preview.offerings', []),
      },
      georestrictions: {
        availability: getGeoAvailabilityCode(
          _parseInt(
            _get(data, ['preview', 'georestrictions', 'availability'], -1),
          ),
        ),
        countries: _keys(
          _get(data, ['preview', 'georestrictions', 'countries'], {}),
        ),
      },
      duration: _parseInt(_get(data, 'preview.duration', 0)),
    },
    feature: {
      id: _parseInt(_get(data, 'feature.nid', -1)),
      contentId: _get(data, 'feature.contentId'),
      offerings: {
        availability: featureAvailibility,
        subscriptions: _get(data, 'feature.offerings', []),
      },
      georestrictions: {
        availability: getGeoAvailabilityCode(
          _parseInt(
            _get(data, ['feature', 'georestrictions', 'availability'], -1),
          ),
        ),
        countries: _keys(
          _get(data, ['feature', 'georestrictions', 'countries'], {}),
        ),
      },
      duration: _parseInt(_get(data, 'feature.duration', 0)),
    },
    siteSegment: {
      id: _parseInt(_get(data, ['site_segment', 'id'], -1)),
      name: _get(data, ['site_segment', 'name'], null),
    },
  })
}
