import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _parseInt from 'lodash/parseInt'
import { createModel as createFeaturedEpisodeModel } from 'services/featured-episode'
import { getGeoAvailabilityCode } from 'services/geo-restrictions'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { campaignShouldRender, getVariation } from 'services/testarossa'
import {
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE,
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
} from 'services/subscription'

import {
  isTypeVideo,
  isTypeYogaFitnessVideo,
  isTypeEpisode,
  isTypeYogaFitnessEpisode,
  isTypeSeries,
  isTypeYogaFitnessSeries,
  getContentType,
  getProductType,
  TYPE_PLACEHOLDER,
  TYPE_CMS_NODE,
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
} from 'services/content-type'

export const TYPE_TAB_OVERVIEW = 'overview'
export const TYPE_TAB_EPISODES = 'episodes'
export const TYPE_TAB_RELATED = 'related'
export const PRODUCTION_STATUS_ACTIVE = 'active-production'

const SCHEMA = {
  id: null,
  title: null,
  _dataError: false,
  type: {
    content: null,
    product: null,
  },
  description: null,
  duration: null,
  path: null,
  vote: null,
  voteDown: null,
  guest: null,
  host: null,
  year: null,
  instructor: null,
  yogaDuration: null,
  yogaLevel: null,
  yogaStyle: null,
  yogaLevelPath: null,
  yogaStylePath: null,
  yogaDurationPath: null,
  yogaTeacherPath: null,
  fitnessDuration: null,
  fitnessLevel: null,
  fitnessStyle: null,
  fitnessLevelPath: null,
  fitnessStylePath: null,
  fitnessDurationPath: null,
  fitnessInstructorPath: null,
  season: null,
  episode: null,
  totalEpisodes: 0,
  totalSeasons: 0,
  seriesId: null,
  seriesTitle: null,
  seriesPath: null,
  featuredType: null,
  featuredEpisode: null,
  backgroundImage: {
    small: null,
    mediumSmall: null,
    medium: null,
    large: null,
  },
  commentTotalCount: null,
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
    shareAllowed: null,
  },
  productionStatus: null,
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
    shareAllowed: null,
  },
  seasonNums: [],
}

const SCHEMA_EPISODE_SERIES = {
  id: null,
  _dataError: false,
  productionStatus: null,
  seasonNums: [],
}

export function getPlaceholder () {
  return _assign(_cloneDeep(SCHEMA), { type: { content: TYPE_PLACEHOLDER } })
}

export async function getEpisodeSeries (options) {
  const { seriesId, language } = options
  try {
    const res = await apiGet(`node/${seriesId}`, { language }, {}, TYPE_BROOKLYN)
    return handleEpisodeSeries(res, seriesId)
  } catch (e) {
    return handleEpisodeSeries({}, seriesId, true)
  }
}

function handleEpisodeSeries (res, seriesId, _dataError) {
  const data = _get(res, 'body', {})
  return createEpisodeSeriesModel(seriesId, data, _dataError)
}

function createEpisodeSeriesModel (seriesId, data, _dataError) {
  return _assign(_cloneDeep(SCHEMA_EPISODE_SERIES), {
    id: seriesId,
    _dataError,
    seasonNums: _get(data, 'season_nums', []),
    productionStatus: _get(data, 'production_status', ''),
  })
}

export async function get (options = {}) {
  const { id, language } = options
  try {
    const res = await apiGet(`node/${id}`, { language }, {}, TYPE_BROOKLYN)
    const data = _get(res, 'body', {})
    const type = getContentType(TYPE_CMS_NODE, data)
    if (isTypeVideo(type) || isTypeYogaFitnessVideo(type)) {
      return handleVideoResponse(res)
    } else if (isTypeEpisode(type) || isTypeYogaFitnessEpisode(type)) {
      try {
        const series = await getEpisodeSeries({
          language,
          seriesId: _parseInt(_get(res.body, 'series.nid', -1)),
        })
        return handleEpisodeResponse(res, series)
      } catch (e) {
        return handleEpisodeResponse(res, {})
      }
    } else if (isTypeSeries(type) || isTypeYogaFitnessSeries(type)) {
      return handleSeriesResponse(res)
    }
    return handleVideoResponse({ nid: id }, true)
  } catch (e) {
    return handleVideoResponse({ nid: id }, true)
  }
}

function getYogaFitnessLevel (level) {
  if (level) {
    return level.match(/[A-Za-z]/) ? level : `Level ${level}`
  }
  return null
}

export function handleEpisodeResponse (res, series, _dataError) {
  const data = _get(res, 'body', {})
  return createEpisodeModel(
    data,
    series,
    getContentType(TYPE_CMS_NODE, data),
    getProductType(TYPE_CMS_NODE, data),
    _dataError,
  )
}

function createEpisodeModel (
  data,
  series,
  contentType,
  productType,
  _dataError,
) {
  // start RI-108 Description Split test
  let alternateDescription
  if (campaignShouldRender({ campaign: 'RI-108' })) {
    const variation = getVariation({ campaign: 'RI-108' })
    if (variation.friendlyId === 1) {
      if (_get(variation, ['data', _parseInt(_get(data, 'nid', -1))], undefined)) {
        alternateDescription = _get(variation, ['data', _parseInt(_get(data, 'nid', -1)), 'value'], undefined)
      }
    }
  }
  // end RI-108 Description Split test
  const model = {
    id: _parseInt(_get(data, 'nid', -1)),
    _dataError,
    type: {
      content: contentType,
      product: productType,
    },
    title: _get(data, 'title'),
    description: alternateDescription || _get(data, 'fields.body[0].value'),
    path: _get(data, 'path'),
    vote: _parseInt(_get(data, 'fivestar.up_count.value', 0)),
    voteDown: _parseInt(_get(data, 'fivestar.down_count.value', 0)),
    seriesId: _parseInt(_get(data, 'series.nid', -1)),
    seriesTitle: _get(data, 'series')
      ? _get(data, 'series.title')
      : _get(data, 'title'),
    seriesPath: _get(data, 'series.path'),
    seasonNums: _get(series, 'seasonNums', []),
    productionStatus: _get(series, 'productionStatus', ''),
    backgroundImage: {
      small: _get(data, 'hero_image_notext.hero_320x200'),
      mediumSmall: _get(data, 'hero_image_notext.hero_570x300'),
      medium: _get(data, 'hero_image_notext.hero_820x400'),
      large: _get(data, 'hero_image_notext.hero_1440x400'),
    },
    keyart: _get(data, ['keyart_16x9_withtext', 'keyart_1180x664'], ''),
    commentTotalCount: _parseInt(_get(data, 'comment_count', 0)),
    preview: {
      id: _parseInt(_get(data, 'preview.nid', -1)),
      offerings: {
        availability: _get(data, 'preview.isFree')
          ? SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE
          : SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
        subscriptions: _get(data, 'preview.offerings', []),
      },
      georestrictions: {
        availability: getGeoAvailabilityCode(
          _parseInt(
            _get(data, ['preview', 'georestrictions', 'availability'], null),
          ),
        ),
        countries: _keys(
          _get(data, ['preview', 'georestrictions', 'countries'], {}),
        ),
      },
      shareAllowed: _get(data, ['preview', 'shareAllowed'], null),
      duration: _parseInt(_get(data, 'preview.duration', 0)),
    },
    feature: {
      id: _parseInt(_get(data, 'feature.nid', -1)),
      offerings: {
        availability: _get(data, 'feature.isFree')
          ? SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE
          : SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
        subscriptions: _get(data, 'feature.offerings', []),
      },
      georestrictions: {
        availability: getGeoAvailabilityCode(
          _parseInt(
            _get(data, ['feature', 'georestrictions', 'availability'], null),
          ),
        ),
        countries: _keys(
          _get(data, ['feature', 'georestrictions', 'countries'], {}),
        ),
      },
      shareAllowed: _get(data, ['feature', 'shareAllowed'], null),
      duration: _parseInt(_get(data, 'feature.duration', 0)),
    },
    instructor: _get(data, 'fields.instructor[0].value'),
  }

  switch (contentType) {
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_SEGMENT_YOGA: {
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
      model.yogaDuration = _get(data, 'feature.duration')
        ? _parseInt(_get(data, 'feature.duration'))
        : null
      model.yogaLevel = getYogaFitnessLevel(yogaLevelName)
      model.yogaStyle = yogaStyleName
      model.yogaLevelPath = yogaLevelPath
      model.yogaDurationPath = yogaDurationPath
      model.yogaStylePath = yogaStylePath
      model.season = _get(data, 'fields.season[0].value')
        ? _parseInt(_get(data, 'fields.season[0].value'))
        : null
      model.episode = _get(data, 'fields.episode[0].value')
        ? _parseInt(_get(data, 'fields.episode[0].value'))
        : null
      break
    }
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_SEGMENT_FITNESS: {
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
      model.fitnessDuration = _get(data, 'feature.duration')
        ? _parseInt(_get(data, 'feature.duration'))
        : null
      model.fitnessLevel = getYogaFitnessLevel(fitnessLevelName)
      model.fitnessStyle = fitnessStyleName
      model.fitnessLevelPath = fitnessLevelPath
      model.fitnessDurationPath = fitnessDurationPath
      model.fitnessStylePath = fitnessStylePath
      model.season = _get(data, 'fields.season[0].value')
        ? _parseInt(_get(data, 'fields.season[0].value'))
        : null
      model.episode = _get(data, 'fields.episode[0].value')
        ? _parseInt(_get(data, 'fields.episode[0].value'))
        : null
      break
    }
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      model.meditationStyle = 'Meditation'
      model.season = _get(data, 'fields.season[0].value')
        ? _parseInt(_get(data, 'fields.season[0].value'))
        : null
      model.episode = _get(data, 'fields.episode[0].value')
        ? _parseInt(_get(data, 'fields.episode[0].value'))
        : null
      break
    default:
      delete model.instructor
      model.duration = _get(data, 'feature.duration')
        ? _parseInt(_get(data, 'feature.duration'))
        : null
      model.year = _get(data, 'fields.copyright[0].value')
      model.guest = _get(data, 'fields.cast[0].value')
      model.season = _get(data, 'fields.season[0].value')
        ? _parseInt(_get(data, 'fields.season[0].value'))
        : null
      model.episode = _get(data, 'fields.episode[0].value')
        ? _parseInt(_get(data, 'fields.episode[0].value'))
        : null
  }

  return _assign(_cloneDeep(SCHEMA), model)
}

export function handleSeriesResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return createSeriesModel(
    data,
    getContentType(TYPE_CMS_NODE, data),
    getProductType(TYPE_CMS_NODE, data),
    _dataError,
  )
}

function createSeriesModel (data, contentType, productType, _dataError) {
  // start RI-108 Description Split test
  let alternateDescription
  if (campaignShouldRender({ campaign: 'RI-108' })) {
    const variation = getVariation({ campaign: 'RI-108' })
    if (variation.friendlyId === 1) {
      if (_get(variation, ['data', _parseInt(_get(data, 'nid', -1))], undefined)) {
        alternateDescription = _get(variation, ['data', _parseInt(_get(data, 'nid', -1)), 'value'], undefined)
      }
    }
  }
  // end RI-108 Description Split test
  const model = {
    id: _parseInt(_get(data, 'nid', -1)),
    _dataError,
    title: _get(data, 'title'),
    type: {
      content: contentType,
      product: productType,
    },
    description: alternateDescription || _get(data, 'fields.body[0].value'),
    path: _get(data, 'path'),
    vote: _parseInt(_get(data, 'fivestar.up_count.value', 0)),
    voteDown: _parseInt(_get(data, 'fivestar.down_count.value', 0)),
    commentTotalCount: _parseInt(_get(data, 'comment_count', 0)),
    seriesId: _parseInt(_get(data, 'nid', -1)),
    seriesTitle: _get(data, 'title'),
    totalSeasons: _parseInt(_get(data, 'total_seasons', 0)),
    seasonNums: _get(data, 'season_nums', []),
    productionStatus: _get(data, 'production_status', ''),
    seriesPath: _get(data, 'path'),
    totalEpisodes: _get(data, 'total_episodes'),
    host: _get(data, 'fields.instructor[0].value'),
    featuredType: _get(data, 'featured_type'),
    featuredEpisode: _get(data, 'featured_episode')
      ? createFeaturedEpisodeModel(data)
      : null,
    backgroundImage: {
      small: _get(data, 'hero_image_notext.hero_320x200'),
      mediumSmall: _get(data, 'hero_image_notext.hero_570x300'),
      medium: _get(data, 'hero_image_notext.hero_820x400'),
      large: _get(data, 'hero_image_notext.hero_1440x400'),
    },
  }

  switch (contentType) {
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      delete model.totalSeasons
      break
    default:
  }

  return _assign(_cloneDeep(SCHEMA), model)
}

export function handleVideoResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return createVideoModel(
    data,
    getContentType(TYPE_CMS_NODE, data),
    getProductType(TYPE_CMS_NODE, data),
    _dataError,
  )
}

function createVideoModel (data, contentType, productType, _dataError) {
  // start RI-108 Description Split test
  let alternateDescription
  if (campaignShouldRender({ campaign: 'RI-108' })) {
    const variation = getVariation({ campaign: 'RI-108' })
    if (variation.friendlyId === 1) {
      if (_get(variation, ['data', _parseInt(_get(data, 'nid', -1))], undefined)) {
        alternateDescription = _get(variation, ['data', _parseInt(_get(data, 'nid', -1)), 'value'], undefined)
      }
    }
  }
  // end RI-108 Description Split test
  const model = {
    id: _parseInt(_get(data, 'nid', -1)),
    _dataError,
    type: {
      content: contentType,
      product: productType,
    },
    title: _get(data, 'title'),
    description: alternateDescription || _get(data, 'fields.body[0].value'),
    vote: _parseInt(_get(data, 'fivestar.up_count.value', 0)),
    voteDown: _parseInt(_get(data, 'fivestar.down_count.value', 0)),
    path: _get(data, 'path'),
    guest: _get(data, 'fields.cast[0].value'),
    host: _get(data, 'fields.instructor[0].value'),
    year: _get(data, 'fields.copyright[0].value'),
    backgroundImage: {
      small: _get(data, 'hero_image_notext.hero_320x200'),
      mediumSmall: _get(data, 'hero_image_notext.hero_570x300'),
      medium: _get(data, 'hero_image_notext.hero_820x400'),
      large: _get(data, 'hero_image_notext.hero_1440x400'),
    },
    commentTotalCount: _parseInt(_get(data, 'comment_count', 0)),
    preview: {
      id: _parseInt(_get(data, 'preview.nid', -1)),
      offerings: {
        availability: _get(data, 'preview.isFree')
          ? SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE
          : SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
        subscriptions: _get(data, 'preview.offerings', []),
      },
      georestrictions: {
        availability: getGeoAvailabilityCode(
          _parseInt(
            _get(data, ['preview', 'georestrictions', 'availability'], null),
          ),
        ),
        countries: _keys(
          _get(data, ['preview', 'georestrictions', 'countries'], {}),
        ),
      },
      shareAllowed: _get(data, ['preview', 'shareAllowed'], null),
      duration: _parseInt(_get(data, 'preview.duration', 0)),
    },
    feature: {
      id: _parseInt(_get(data, 'feature.nid', -1)),
      offerings: {
        availability: _get(data, 'feature.isFree')
          ? SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE
          : SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
        subscriptions: _get(data, 'feature.offerings', []),
      },
      georestrictions: {
        availability: getGeoAvailabilityCode(
          _parseInt(
            _get(data, ['feature', 'georestrictions', 'availability'], null),
          ),
        ),
        countries: _keys(
          _get(data, ['feature', 'georestrictions', 'countries'], {}),
        ),
      },
      shareAllowed: _get(data, ['feature', 'shareAllowed'], null),
      duration: _parseInt(_get(data, 'feature.duration', 0)),
    },
  }

  switch (contentType) {
    case TYPE_CONTENT_VIDEO_YOGA: {
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
      model.instructor = _get(data, 'fields.instructor[0].value')
      model.yogaDuration = _get(data, 'feature.duration')
        ? _parseInt(_get(data, 'feature.duration'))
        : null
      model.yogaLevel = getYogaFitnessLevel(yogaLevelName)
      model.yogaStyle = yogaStyleName
      model.yogaLevelPath = yogaLevelPath
      model.yogaDurationPath = yogaDurationPath
      model.yogaStylePath = yogaStylePath
      model.yogaTeacherPath = yogaTeacherPath
      break
    }
    case TYPE_CONTENT_VIDEO_FITNESS: {
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
      model.instructor = _get(data, 'fields.instructor[0].value')
      model.fitnessDuration = _get(data, 'feature.duration')
        ? _parseInt(_get(data, 'feature.duration'))
        : null
      model.fitnessLevel = getYogaFitnessLevel(fitnessLevelName)
      model.fitnessStyle = fitnessStyleName
      model.fitnessLevelPath = fitnessLevelPath
      model.fitnessDurationPath = fitnessDurationPath
      model.fitnessStylePath = fitnessStylePath
      model.fitnessInstructorPath = fitnessInstructorPath
      break
    }
    case TYPE_CONTENT_VIDEO_MEDITATION:
      model.instructor = _get(data, 'fields.instructor[0].value')
      model.meditationStyle = 'Meditation'
      break
    default:
      model.duration = _parseInt(_get(data, 'feature.duration', 0))
  }

  return _assign(_cloneDeep(SCHEMA), model)
}
