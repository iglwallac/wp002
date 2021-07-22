import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { get as getConfig } from 'config'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _parseInt from 'lodash/parseInt'
import _replace from 'lodash/replace'
import {
  getContentType,
  getProductType,
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
  TYPE_CMS_NODE,
  TYPE_CMS_TERM,
  TYPE_PLACEHOLDER,
} from 'services/content-type'
import {
  RESOLVER_TYPE_SUBCATEGORY,
  RESOLVER_TYPE_NODE,
} from 'services/resolver/types'
import { getGeoAvailabilityCode } from 'services/geo-restrictions'
import {
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_IS_FREE,
  SUBSCRIPTION_OFFERINGS_AVAILABILITY_ONLY_WITH,
} from 'services/subscription'
import {
  OG_TYPE_WEBSITE,
  OG_TYPE_VIDEO_MOVIE,
  OG_TYPE_VIDEO_EPISODE,
  OG_TYPE_VIDEO_TV_SHOW,
} from 'services/open-graph'

const { origin } = getConfig()

const SCHEMA = {
  id: null,
  _dataError: null,
  type: {
    content: null,
    product: null,
  },
  title: null,
  description: null,
  path: null,
  heroImage: {
    small: null,
    mediumSmall: null,
    medium: null,
    large: null,
  },
  heroImageNoText: {
    large: null,
  },
  mediaAvailabilty: null,
  runtime: null,
  year: null,
  seriesId: null,
  seriesTitle: null,
  seriesPath: null,
  host: null,
  season: null,
  episode: null,
  yogaLevel: null,
  yogaStyle: null,
  fitnessLevel: null,
  fitnessStyle: null,
  meditationStyle: null,
  guest: null,
  vote: null,
  voteDown: null,
  filterSet: null,
  preview: {
    id: null,
    offerings: [],
    georestrictions: {
      availability: null,
      countries: [],
    },
    shareAllowed: null,
  },
  feature: {
    id: null,
    offerings: [],
    georestrictions: {
      availability: null,
      countries: [],
    },
    shareAllowed: null,
  },
  seo: {
    title: null,
    description: null,
    robots: {
      noIndex: null,
      noFollow: null,
    },
  },
  social: {
    og: {
      title: null,
      image: null,
      description: null,
      type: null,
      url: null,
    },
  },
}

function getYogaFitnessLevel (level) {
  if (level) {
    return level.match(/[A-Za-z]/) ? level : `Level ${level}`
  }
  return null
}

export function getOgType (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO:
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
      return OG_TYPE_VIDEO_MOVIE
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return OG_TYPE_VIDEO_EPISODE
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return OG_TYPE_VIDEO_TV_SHOW
    default:
      return OG_TYPE_WEBSITE
  }
}

export function getPlaceholder () {
  return _assign(_cloneDeep(SCHEMA), { type: { content: TYPE_PLACEHOLDER } })
}

export function get (options) {
  const { id, type, auth, language } = options
  switch (type) {
    case RESOLVER_TYPE_NODE:
      return getNode({ id, auth, language })
    case RESOLVER_TYPE_SUBCATEGORY:
    default:
      // @TODO Is this true for default? Only applies to node and subcategory.
      return getTerm({ id, auth, language })
  }
}

export async function getNode (options) {
  const { id, language } = options
  try {
    const res = await apiGet(`node/${id}`, { language }, {}, TYPE_BROOKLYN)
    return handleNodeResponse(res)
  } catch (e) {
    return handleNodeResponse({ id }, true)
  }
}

export function handleNodeResponse (res, _dataError) {
  const data = _get(res, 'body', {})
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
  const contentType = getContentType(TYPE_CMS_NODE, data)
  const jumbotron = _assign(_cloneDeep(SCHEMA), {
    id: _parseInt(_get(data, 'nid', -1)),
    _dataError,
    type: {
      content: contentType,
      product: getProductType(TYPE_CMS_NODE, data),
    },
    title: _get(data, 'title'),
    path: _get(data, 'path'),
    seriesId: _parseInt(_get(data, 'series.nid', -1)),
    seriesTitle: _get(data, 'series.title', ''),
    seriesPath: _get(data, 'series.path'),
    host: _get(data, 'fields.instructor[0].value', null),
    season: _get(data, 'fields.season[0].value', null)
      ? _parseInt(_get(data, 'fields.season[0].value'))
      : null,
    episode: _get(data, 'fields.episode[0].value', null)
      ? _parseInt(_get(data, 'fields.episode[0].value'))
      : null,
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
      contentType === TYPE_CONTENT_VIDEO_MEDITATION ? 'Meditation' : null,
    guest: _get(data, 'fields.cast[0].value', null),
    vote: _parseInt(_get(data, 'fivestar.up_count.value', 0)),
    voteDown: _parseInt(_get(data, 'fivestar.down_count.value', 0)),
    runtime: _parseInt(_get(data, 'feature.duration', 0)),
    year: _get(data, 'fields.copyright[0].value', null),
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
    seo: {
      title: _get(data, 'seo.title')
        ? _get(data, 'seo.title')
        : _get(data, 'title'),
      description: _get(data, 'seo.description', null),
      robots: {
        noIndex: _get(data, 'seo.robots.noIndex', false),
        noFollow: _get(data, 'seo.robots.noFollow', false),
      },
    },
    social: {
      og: {
        title: _get(data, 'title', ''),
        image: _get(data, 'keyart_16x9_withtext.keyart_1180x664', ''),
        description: _replace(
          _get(data, ['fields', 'teaser', 0, 'value'], ''),
          /\r?\n|\r/,
          '',
        ),
        type: getOgType(contentType),
        url: `${origin}/${_get(data, 'path', '')}`,
      },
    },
  })
  switch (contentType) {
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      if (_get(data, 'hero_image_withtext')) {
        jumbotron.heroImage = {
          small: _get(data, 'hero_image_withtext.hero_570x200'),
          mediumSmall: _get(data, 'hero_image_withtext.hero_820x300'),
          medium: _get(data, 'hero_image_withtext.hero_1070x400'),
          large: _get(data, 'hero_image_withtext.hero_1440x400'),
        }
      }
      if (_get(data, 'hero_image_notext')) {
        jumbotron.heroImageNoText = {
          large: _get(data, 'hero_image_notext.hero_1440x400'),
        }
      }
      break
    default:
      if (_get(data, 'hero_image_notext')) {
        jumbotron.heroImage = {
          small: _get(data, 'hero_image_notext.hero_570x200'),
          mediumSmall: _get(data, 'hero_image_notext.hero_820x300'),
          medium: _get(data, 'hero_image_notext.hero_1070x400'),
          large: _get(data, 'hero_image_notext.hero_1440x400'),
        }
      }
      break
  }
  return jumbotron
}

async function getTerm (options) {
  const { id, auth, language } = options
  try {
    const res = await apiGet(`term/${id}`, { language }, { auth }, TYPE_BROOKLYN)
    return handleTermResponse(res, id)
  } catch (e) {
    return handleTermResponse({}, id, true)
  }
}

export function handleTermResponse (res, tid, _dataError) {
  const data = _get(res, 'body', {})
  const jumbotron = _assign(_cloneDeep(SCHEMA), {
    id: tid,
    _dataError,
    type: {
      content: getContentType(TYPE_CMS_TERM, data),
      product: getProductType(TYPE_CMS_TERM, data),
    },
    title: _get(data, 'seo.h1') ? _get(data, 'seo.h1') : _get(data, 'name'),
    filterSet: _get(data, 'filterSet', null),
    description: _get(data, 'body', ''),
    heroImage: {
      small: _get(data, 'termImages.hero.hero_320x200'),
      mediumSmall: _get(data, 'termImages.hero.hero_700x300'),
      medium: _get(data, 'termImages.hero.hero_1070x300'),
      large: _get(data, 'termImages.hero.hero_1440x300'),
    },
    seo: {
      title: _get(data, 'seo.title')
        ? _get(data, 'seo.title')
        : _get(data, 'name'),
      description: _get(data, 'seo.description', null),
      robots: {
        noIndex: _get(data, 'seo.robots.noIndex', false),
        noFollow: _get(data, 'seo.robots.noFollow', false),
      },
    },
    social: {
      og: {
        title: _get(data, 'name', ''),
        image: _get(data, 'termImages.tile.tile_561x234', ''),
        description: _get(data, 'seo.description', ''),
        type: OG_TYPE_WEBSITE,
      },
    },
  })
  return jumbotron
}
