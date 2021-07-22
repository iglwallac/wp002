import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _parseInt from 'lodash/parseInt'
import _size from 'lodash/size'
import {
  getRealContentType,
  getRealDisplayType,
  getRealProductType,
  getContentType,
  getProductType,
  TYPE_CMS_NODE,
  TYPE_CMS_TERM,
  TYPE_CONTENT_VIDEO_MEDITATION,
  TYPE_CONTENT_SERIES_LINK,
} from 'services/content-type'
import { getGeoAvailabilityCode } from 'services/geo-restrictions'
import {
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE,
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
} from 'services/subscription'
import { format as formatTime } from 'services/date-time'

const SCHEMA = {
  id: null,
  _dataError: null,
  nid: null,
  tid: null,
  type: {
    content: null,
    product: null,
  },
  contentType: null,
  productType: null,
  displayType: null,
  title: null,
  seriesId: null,
  seriesTitle: null,
  seriesLogo: null,
  seriesPath: null,
  image: null,
  imageWithText: null,
  episode: null,
  episodeCount: null,
  season: null,
  seasonCount: null,
  vote: null,
  voteDown: null,
  isNew: false,
  hasNewEpisodes: false,
  featuredTileType: null,
  featuredTileLabel: null,
  featuredTileCampaignId: null,
  duration: null,
  url: null,
  yogaLevel: null,
  yogaStyle: null,
  yogaLevelPath: null,
  yogaStylePath: null,
  yogaDurationPath: null,
  yogaTeacherPath: null,
  fitnessLevel: null,
  fitnessStyle: null,
  fitnessLevelPath: null,
  fitnessStylePath: null,
  fitnessDurationPath: null,
  fitnessInstructorPath: null,
  meditationStyle: null,
  host: null,
  year: null,
  teaser: null,
  body: null,
  heroImage: {
    small: null,
    mediumSmall: null,
    medium: null,
    large: null,
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
  created: null,
  createdDateTimeText: null,
}

const SCHEMA_SERIES_LINK = {
  type: {
    content: TYPE_CONTENT_SERIES_LINK,
  },
  path: null,
}

function getYogaFitnessLevel (level) {
  if (level) {
    return /[A-Za-z]/.test(level) ? level : `Level ${level}`
  }
  return null
}

// NOTE: this service does not appear to be in use (possibly deprecated)
// I Seconds this. Remove??
export async function get (options) {
  const { id, language } = options
  try {
    const res = await apiGet(`node/${id}`, { language }, {}, TYPE_BROOKLYN)
    return handleResponse(res)
  } catch (e) {
    return handleResponse({}, true)
  }
}

export function handleResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, _dataError)
}

export function createModel (data, locale, _dataError, options = {}) {
  const yogaLevelName = _get(
    data,
    'classicFacets.yogaLevel[0].name',
    _get(data, 'classicFacets.yoga_level[0].name'),
  )
  const yogaStyleName = _get(
    data,
    'classicFacets.yogaStyle[0].name',
    _get(data, 'classicFacets.yoga_style[0].name'),
  )
  const yogaLevelPath = _get(
    data,
    'classicFacets.yogaLevel[0].path',
    _get(data, 'classicFacets.yoga_level[0].path'),
  )
  const yogaDurationPath = _get(
    data,
    'classicFacets.yogaDuration[0].path',
    _get(data, 'classicFacets.yoga_duration[0].path'),
  )
  const yogaStylePath = _get(
    data,
    'classicFacets.yogaStyle[0].path',
    _get(data, 'classicFacets.yoga_style[0].path'),
  )
  const yogaTeacherPath = _get(
    data,
    'classicFacets.yogaTeacher[0].path',
    _get(data, 'classicFacets.yoga_teacher[0].path'),
  )
  const fitnessLevelName = _get(
    data,
    'classicFacets.fitnessLevel[0].name',
    _get(data, 'classicFacets.fitness_level[0].name'),
  )
  const fitnessStyleName = _get(
    data,
    'classicFacets.fitnessStyle[0].name',
    _get(data, 'classicFacets.fitness_style[0].name'),
  )
  const fitnessLevelPath = _get(
    data,
    'classicFacets.fitnessLevel[0].path',
    _get(data, 'classicFacets.fitness_level[0].path'),
  )
  const fitnessDurationPath = _get(
    data,
    'classicFacets.fitnessDuration[0].path',
    _get(data, 'classicFacets.fitness_duration[0].path'),
  )
  const fitnessStylePath = _get(
    data,
    'classicFacets.fitnessStyle[0].path',
    _get(data, 'classicFacets.fitness_style[0].path'),
  )
  const fitnessInstructorPath = _get(
    data,
    'classicFacets.fitnessInstructor[0].path',
    _get(data, 'classicFacets.fitness_instructor[0].path'),
  )
  const contentTypeNode = getContentType(TYPE_CMS_NODE, data)
  const featureMediaId = _parseInt(
    _get(data, 'feature.mediaId', _get(data, 'feature.nid', -1)),
  )
  const previewMediaId = _parseInt(
    _get(data, 'preview.mediaId', _get(data, 'preview.nid', -1)),
  )
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
  const created = _parseInt(_get(data, 'created', 0)) * 1000
  const createdDateTimeText = formatTime(created, locale)
  const year = _get(
    data,
    'fields.copyright[0].value',
    _get(data, 'copyright', null),
  )

  // This block of code is for allowing a term tile
  let realContentType
  let realProductType
  let realDisplayType
  let imageWithText
  let contentType
  let productType
  let tileImageClean
  let tileImage

  if (_get(data, 'tid') && _get(data, 'type') === TYPE_CMS_TERM) {
    contentType = getContentType(TYPE_CMS_TERM, data)
    productType = getProductType(TYPE_CMS_TERM, data)
    tileImage = _get(data, ['termImages', 'tile', 'tile_561x234'], '')
  } else {
    realContentType = getRealContentType(data)
    realProductType = getRealProductType(data)
    realDisplayType = getRealDisplayType(data)
    contentType = getContentType(TYPE_CMS_NODE, data)
    productType = getProductType(TYPE_CMS_NODE, data)
    imageWithText = _get(data, 'keyart_16x9_withtext.keyart_304x171', null)
    tileImage = _get(data, 'keyart_16x9_withtext.keyart_304x171', null)
    tileImageClean = _get(data, 'keyart_16x9_notext.keyart_304x171', null)
  }
  const model = _assign(_cloneDeep(SCHEMA), {
    userInfo: _get(data, 'userInfo', null),
    id: _parseInt(_get(data, 'nid', 0)),
    _dataError,
    nid: _parseInt(_get(data, 'nid', 0)),
    tid: _parseInt(_get(data, 'tid', 0)),
    // Use these simple types:
    contentType: realContentType,
    productType: realProductType,
    displayType: realDisplayType,
    // Stop using this legacy type map:
    type: {
      content: contentType,
      product: productType,
    },
    createdDateTimeText,
    created,
    published: _parseInt(_get(data, 'status', 0)) === 1,
    title: _get(data, 'title', null),
    seriesTitle: _get(data, 'series.title', null),
    seriesLogo: _get(data, 'series.logo_xl') || _get(data, ['logo_image', 'logo_xl'], null),
    // eslint-disable-next-line no-script-url
    seriesPath: _get(data, 'series.path', 'javascript:void(0)'),
    seriesId: _get(data, 'series.nid', null),
    image: tileImage, // @TODO Fix component to render blank image and remove empty string.
    imageClean: tileImageClean,
    imageWithText, // @TODO Fix component to render blank image and remove empty string.
    verticalImage: _get(data, 'coverart_image.hdtv_385x539', ''),
    episode: intOrNull(data, 'fields.episode[0].value', 0),
    episodeCount: intOrNull(data, 'total_episodes', 0),
    season: intOrNull(data, 'fields.season[0].value', 0),
    seasonCount: intOrNull(data, 'total_seasons', 0),
    vote: _get(data, 'fivestar.up_count.value', 0),
    voteDown: _get(data, 'fivestar.down_count.value', 0),
    isNew: _get(data, 'is_new', false),
    hasNewEpisodes: _get(data, 'has_new_episodes', false),
    featuredTileType: _get(data, 'featuredType', null),
    featuredTileLabel: _get(data, ['merchandising', 'label'], null),
    featuredTileCampaignId: _get(data, ['merchandising', 'campaignId'], null),
    duration: _parseInt(_get(data, 'feature.duration', 0)),
    // eslint-disable-next-line no-script-url
    url: _get(data, 'path', 'javascript:void(0)'),
    host: _get(data, 'fields.instructor[0].value', null),
    year,
    teaser: _get(data, 'fields.teaser[0].value', ''),
    body: _get(data, 'fields.body[0].value', ''),
    yogaLevel: yogaLevelName ? getYogaFitnessLevel(yogaLevelName) : null,
    yogaStyle: yogaStyleName || null,
    yogaLevelPath: yogaLevelPath || null,
    yogaStylePath: yogaStylePath || null,
    yogaDurationPath: yogaDurationPath || null,
    yogaTeacherPath: yogaTeacherPath || null,
    fitnessLevel: fitnessLevelName
      ? getYogaFitnessLevel(fitnessLevelName)
      : null,
    fitnessStyle: fitnessStyleName || null,
    fitnessLevelPath: fitnessLevelPath || null,
    fitnessStylePath: fitnessStylePath || null,
    fitnessDurationPath: fitnessDurationPath || null,
    fitnessInstructorPath: fitnessInstructorPath || null,
    meditationStyle:
      contentTypeNode === TYPE_CONTENT_VIDEO_MEDITATION ? 'Meditation' : null,
    viewedTotal: _parseInt(_get(data, 'viewed.total', -1)),
    recommendedTotal: _parseInt(_get(data, 'voted.total', -1)),
    commentedTotal: _parseInt(_get(data, 'commented.total', -1)),
    preview: {
      id: previewMediaId,
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
      id: featureMediaId,
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
    reason: {
      source: _get(data, ['reason', 'source'], null),
      videoTasteSegment: _get(data, ['reason', 'videoTasteSegment'], null),
      score: parseFloat(_get(data, ['reason', 'score'], 0)),
    },
  })
  switch (contentTypeNode) {
    default:
      model.heroImage = {
        small: _get(data, 'hero_image_notext.hero_570x200'),
        mediumSmall: _get(data, 'hero_image_notext.hero_820x300'),
        medium: _get(data, 'hero_image_notext.hero_1070x400'),
        large: _get(data, 'hero_image_notext.hero_1440x400'),
      }
  }

  // tack on keyart
  if (_get(options, ['keyartNoText'])) {
    model.keyartNoText = {
      small: _get(data, 'keyart_16x9_notext.keyart_304x171'),
      mediumSmall: _get(data, 'keyart_16x9_notext.keyart_570x321'),
      medium: _get(data, 'keyart_16x9_notext.keyart_820x461'),
      large: _get(data, 'keyart_16x9_notext.keyart_1070x602'),
    }
  }
  return model
}

/**
 * prevent NaN from being mapped by model creation functions above and below
 *
 * @param {object} data
 * @param {string} path
 * @param {int} defaultValue
 */
function intOrNull (data, path, defaultValue = 0) {
  const value = _get(data, path, defaultValue)

  if (value === null) {
    return value
  }

  const parsedValue = _parseInt(value, 10)

  if (isNaN(parsedValue)) {
    return null
  }

  return parsedValue
}

export function createStandardModel (data, _dataError) {
  const yogaLevelName = _get(data, 'yogaLevel')
    ? _get(data, 'yogaLevel', []).join(', ')
    : null
  const yogaStyleName = _get(data, 'yogaStyle')
    ? _get(data, 'yogaStyle', []).join(', ')
    : null
  const fitnessLevelName = _get(data, 'fitnessLevel')
    ? _get(data, 'fitnessLevel', []).join(', ')
    : null
  const fitnessStyleName = _get(data, 'fitnessStyle')
    ? _get(data, 'fitnessStyle', []).join(', ')
    : null
  const contentTypeNode = getContentType(TYPE_CMS_NODE, data)

  // This block of code is for allowing a term tile
  let contentType
  let productType
  let tileImage
  let imageWithText
  if (_get(data, 'tid') && _get(data, 'type') === TYPE_CMS_TERM) {
    contentType = getContentType(TYPE_CMS_TERM, data)
    productType = getProductType(TYPE_CMS_TERM, data)
    tileImage = _get(data, ['termImages', 'tile', 'tile_561x234'], '')
  } else {
    contentType = getContentType(TYPE_CMS_NODE, data)
    productType = getProductType(TYPE_CMS_NODE, data)
    tileImage = _get(data, 'keyart16x9WithText.small', '')
    imageWithText = {
      small: _get(data, 'keyart16x9NoText.small', null),
      medium: _get(data, 'keyart16x9NoText.medium', null),
      large: _get(data, 'keyart16x9NoText.large', null),
    }
  }

  const model = _assign(_cloneDeep(SCHEMA), {
    id: _parseInt(_get(data, 'id', -1)),
    _dataError,
    nid: _parseInt(_get(data, 'id', -1)),
    tid: _parseInt(_get(data, 'tid', -1)),
    type: {
      content: contentType,
      product: productType,
    },
    title: _get(data, 'title', null),
    seriesTitle: _get(data, 'seriesTitle', null),
    seriesLogo: _get(data, 'seriesLogo', null),
    // eslint-disable-next-line no-script-url
    seriesPath: _get(data, 'seriesPath', 'javascript:void(0)'),
    image: tileImage, // @TODO Fix component to render blank image and remove empty string.
    imageWithText, // @TODO Fix component to render blank image and remove empty string.
    episode: intOrNull(data, 'episode', 0),
    episodeCount: intOrNull(data, 'episodeCount', 0),
    season: intOrNull(data, 'season', 0),
    seasonCount: intOrNull(data, 'seasonCount', 0),
    teaser: _get(data, 'teaser', null),
    body: _get(data, 'body', null),
    vote: _get(data, 'voteUpCount', 0),
    voteDown: _get(data, 'voteDownCount', 0),
    isNew: _get(data, 'isNew', false),
    hasNewEpisodes: _get(data, 'hasNewEpisodes', false),
    featuredTileType: _get(data, 'featuredType', null),
    featuredTileLabel: _get(data, ['merchandising', 'label'], null),
    featuredTileCampaignId: _get(data, ['merchandising', 'campaignId'], null),
    duration: _parseInt(_get(data, 'feature.duration', 0)),
    // eslint-disable-next-line no-script-url
    url: _get(data, 'path', 'javascript:void(0)'),
    host: _get(data, 'host', null),
    yogaLevel: yogaLevelName ? getYogaFitnessLevel(yogaLevelName) : null,
    yogaStyle: yogaStyleName || null,
    fitnessLevel: fitnessLevelName
      ? getYogaFitnessLevel(fitnessLevelName)
      : null,
    fitnessStyle: fitnessStyleName || null,
    meditationStyle:
      contentTypeNode === TYPE_CONTENT_VIDEO_MEDITATION ? 'Meditation' : null,
    preview: {
      id: _parseInt(_get(data, 'preview.id', -1)),
      offerings: {
        availability: _get(data, 'preview.offerings.availability', null),
        subscriptions: _get(data, 'preview.offerings.subscriptions', []),
      },
      georestrictions: {
        availability: _get(
          data,
          ['preview', 'georestrictions', 'availability'],
          null,
        ),
        countries: _get(data, ['preview', 'georestrictions', 'countries'], []),
      },
      duration: _parseInt(_get(data, 'preview.duration', 0)),
    },
    feature: {
      id: _parseInt(_get(data, 'feature.id', -1)),
      offerings: {
        availability: _get(data, 'feature.offerings.availability', null),
        subscriptions: _get(data, 'feature.offerings.subscriptions', []),
      },
      georestrictions: {
        availability: _get(
          data,
          ['feature', 'georestrictions', 'availability'],
          null,
        ),
        countries: _get(data, ['feature', 'georestrictions', 'countries'], []),
      },
      duration: _parseInt(_get(data, 'feature.duration', 0)),
    },
    reason: {
      source: _get(data, ['reason', 'source'], null),
      score: parseFloat(_get(data, ['reason', 'score'], 0)),
    },
  })
  switch (contentTypeNode) {
    default:
      model.heroImage = {
        small: _get(data, 'keyart_16x9_notext.keyart_304x171', null),
        mediumSmall: _get(data, 'keyart_16x9_notext.keyart_570x321', null),
        medium: _get(data, 'keyart_16x9_notext.keyart_820x461', null),
        large: _get(data, 'keyart_16x9_notext.keyart_1070x602', null),
      }
  }
  return model
}

export function createSeriesLinkModel (path) {
  return _assign(_cloneDeep(SCHEMA_SERIES_LINK), {
    path,
  })
}
