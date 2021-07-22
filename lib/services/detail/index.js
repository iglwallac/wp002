import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import _keys from 'lodash/keys'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { createModel as createFeaturedEpisodeModel } from 'services/featured-episode'
import { campaignShouldRender, getVariation } from 'services/testarossa'
import { getGeoAvailabilityCode } from 'services/geo-restrictions'
import {
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE,
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
} from 'services/subscription'

import {
  getContentType,
  getProductType,
  getImpressionType,
  TYPE_PLACEHOLDER,
  TYPE_CMS_NODE,
} from 'services/content-type'

const SCHEMA = {
  id: null,
  _dataError: null,
  type: {
    content: null,
    product: null,
  },
  error: null,
  title: null,
  description: null,
  teaser: null,
  preview: {
    id: -1,
    offerings: [],
    georestrictions: {
      availability: null,
      countries: [],
    },
    shareAllowed: null,
  },
  feature: {
    id: -1,
    offerings: [],
    georestrictions: {
      availability: null,
      countries: [],
    },
    shareAllowed: null,
  },
  siteSegment: {
    id: -1,
    name: null,
  },
  impressionType: null,
  host: null,
  season: null,
  episode: null,
  guest: null,
  runtime: null,
  year: null,
  yogaLevel: null,
  yogaStyle: null,
  language: null,
  vote: 0,
  voteDown: 0,
  seriesId: null,
  seriesTitle: null,
  seriesPath: null,
  featuredType: null,
  fitnessStyle: null,
  fitnessLevel: null,
  format: -1,
  featuredEpisode: null,
  commentTotalCount: 0,
  productionStatus: null,
  productionStatusText: null,
  totalSeasons: 0,
  totalEpisodes: 0,
  seasonNums: [],
  fileAttachments: [],
}

export const PRODUCTION_STATUS_ACTIVE = 'active-production'

export function getPlaceholder () {
  return _assign(_cloneDeep(SCHEMA), { type: { content: TYPE_PLACEHOLDER } })
}

function getYogaFitnessLevel (level) {
  if (level) {
    return /[A-Za-z]/.test(level) ? level : `Level ${level}`
  }
  return null
}

export async function get (options) {
  const { id, language } = options
  try {
    const res = await apiGet(`node/${id}`, { language, f: 'md' }, {}, TYPE_BROOKLYN)
    return handleResponse(res)
  } catch (e) {
    return _assign(_cloneDeep(SCHEMA), {
      id,
      _dataError: true,
    })
  }
}

export function handleResponse (res) {
  const data = _get(res, 'body', {})
  const id = _get(data, 'nid', -1)
  const format = _get(data, 'fields.body[0].format', -1)
  const season = _get(data, 'fields.season[0].value', null)
  const episode = _get(data, 'fields.episode[0].value', null)
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
  // start RI-108 Description Split test
  let alternateDescription
  if (campaignShouldRender({ campaign: 'RI-108' })) {
    const variation = getVariation({ campaign: 'RI-108' })
    if (variation.friendlyId === 1) {
      if (_get(variation, ['data', _parseInt(id)], undefined)) {
        alternateDescription = _get(variation, ['data', _parseInt(id), 'value'], undefined)
      }
    }
  }
  // end RI-108 Description Split test

  return _assign(_cloneDeep(SCHEMA), {
    id: _parseInt(id),
    adminCategory: _get(data, 'admin_category', ''),
    productionStatus: _get(data, 'production_status', ''),
    productionStatusText: _get(data, 'fields.production_status_text[0].value', ''),
    type: {
      content: getContentType(TYPE_CMS_NODE, data),
      product: getProductType(TYPE_CMS_NODE, data),
    },
    impressionType: getImpressionType(data),
    totalSeasons: _parseInt(_get(data, 'total_seasons', '0')),
    totalEpisodes: _parseInt(_get(data, 'total_episodes', '0')),
    seasonNums: _get(data, 'season_nums', []),
    nid: _parseInt(id),
    title: data.title,
    // RI-108 Description Split test
    description: alternateDescription || _get(data, 'fields.body[0].value'),
    teaser: _get(data, 'fields.teaser[0].value'),
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
    },
    siteSegment: {
      id: _parseInt(_get(data, 'site_segment.id', -1)),
      name: _get(data, 'site_segment.name', null),
    },
    host: _get(data, 'fields.instructor[0].value'),
    yogaLevel: yogaLevelName ? getYogaFitnessLevel(yogaLevelName) : null,
    yogaStyle: yogaStyleName || null,
    yogaLevelPath: yogaLevelPath || null,
    yogaStylePath: yogaStylePath || null,
    yogaDurationPath: yogaDurationPath || null,
    yogaTeacherPath: yogaTeacherPath || null,
    season: season ? _parseInt(season) : null,
    episode: episode ? _parseInt(episode) : null,
    format: format ? _parseInt(format) : -1,
    fitnessLevel: fitnessLevelName
      ? getYogaFitnessLevel(fitnessLevelName)
      : null,
    fitnessStyle: fitnessStyleName || null,
    fitnessLevelPath: fitnessLevelPath || null,
    fitnessStylePath: fitnessStylePath || null,
    fitnessDurationPath: fitnessDurationPath || null,
    fitnessInstructorPath: fitnessInstructorPath || null,
    guest: _get(data, 'fields.cast[0].value'),
    runtime: _parseInt(_get(data, 'feature.duration', 0)),
    year: _get(data, 'fields.copyright[0].value', null),
    language: _get(data, 'fields.video_lang[0].value'),
    vote: _parseInt(_get(data, 'fivestar.up_count.value', 0)),
    voteDown: _parseInt(_get(data, 'fivestar.down_count.value', 0)),
    seriesId: _parseInt(_get(data, 'series.nid', -1)),
    seriesTitle: _get(data, 'series.title', ''),
    seriesPath: _get(data, 'series.path'),
    featuredType: _get(data, 'featured_type'),
    merchandising: _get(data, 'merchandising'),
    featuredEpisode: data.featured_episode
      ? createFeaturedEpisodeModel(data)
      : null,
    commentTotalCount: _parseInt(_get(data, 'comment_count', 0)),
    fileAttachments: _get(data, 'fileAttachments', []),
  })
}
