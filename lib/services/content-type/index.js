import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _parseInt from 'lodash/parseInt'
import _toString from 'lodash/toString'

/**
 * CONTENT TYPES
 *
 * Using the following properties/values:
 *    type: product_video, product_series
 *    product_type: single, episode, episodic, segment, segmented
 *    display_type: normal, yoga, fitness
 *    admin_category.tid: 118946 (Meditation), 0 (null)
 *
 * NOTE: Meditation has NEVER been a real attribute in the CMS.  Using admin_category is
 *       completely WRONG!  This needs to be refactored for meditation to be a display type
 *       concept in the CMS, if truly desired as a business concept.
 *
 * Does not impact the design.
 *    production_status
 *
 * Determine the following nid type using the above:
 *
 * video = (4891): product_video, single, normal, 0
 * videoYoga = (106866): product_video, single, yoga, 0
 * videoFitness = (82066): product_video, single, fitness, 0
 * videoMeditation = (82661): product_video, single, yoga, meditation (tid===118946)
 *
 * episode = (102896): product_video, episode, normal, 0
 * episodeYoga = (108886): product_video, episode, yoga, 0
 * episodeFitness = (): product_video, episode, fitness, 0
 * episodeMeditation = (94171): product_video, episode, yoga, meditation (tid===118946)
 *
 * segment
 * segmentYoga = (): product_video, segment, yoga, 0
 * segmentFitness = (27693): product_video, segment, fitness, 0
 *
 * series = (102891): product_series, episodic, normal, 0
 * seriesYoga = (108881): product_series, episodic, yoga, 0
 * seriesFitness = (27692): product_series, segmented, fitness, 0
 * seriesMeditation = (94166): product_series, episodic, yoga, meditation (tid===118946)
 *
 * Variations:
 * `for t in video-{single,episode,segment}-{normal,yoga,fitness} series-{episodic,segmented}-
 * {normal,yoga,fitness}; do echo $t; done`
 *  video-single-normal
 *  video-single-yoga
 *  video-single-fitness
 * #video-single-meditation
 *  video-episode-normal
 *  video-episode-yoga
 *  video-episode-fitness
 * #video-episode-meditation
 *  video-segment-normal
 *  video-segment-yoga
 *  video-segment-fitness
 * #video-segment-meditation
 *  series-episodic-normal
 *  series-episodic-yoga
 *  series-episodic-fitness (doesn't exist)
 * #series-episodic-meditation
 *  series-segmented-normal
 *  series-segmented-yoga
 *  series-segmented-fitness
 * #series-segmented-meditation
 *
 * #Please note, meditation is part of yoga! admin category === 118946 tid
 *
 * We are treating episode === segment and series === segmented for design purposes.
 *
 */

// Content Types
export const TYPE_CONTENT_HOME = 'home'
export const TYPE_CONTENT_CATEGORY_SEEKING_TRUTH = 'seekingTruth'
export const TYPE_CONTENT_CATEGORY_TRANSFORMATION = 'transformation'
export const TYPE_CONTENT_CATEGORY_YOGA = 'yoga'
export const TYPE_CONTENT_CATEGORY_FILMS_DOCS = 'filmsDocs'
export const TYPE_CONTENT_CATEGORY_CENTERS = 'centers'
export const TYPE_CONTENT_SUBCATEGORY = 'subcategory'
export const TYPE_CONTENT_VIDEO = 'video'
export const TYPE_CONTENT_VIDEO_YOGA = 'videoYoga'
export const TYPE_CONTENT_VIDEO_FITNESS = 'videoFitness'
export const TYPE_CONTENT_VIDEO_MEDITATION = 'videoMeditation'
export const TYPE_CONTENT_EPISODE = 'episode'
export const TYPE_CONTENT_EPISODE_YOGA = 'episodeYoga'
export const TYPE_CONTENT_EPISODE_FITNESS = 'episodeFitness'
export const TYPE_CONTENT_EPISODE_MEDITATION = 'episodeMeditation'
export const TYPE_CONTENT_SEGMENT = 'segment'
export const TYPE_CONTENT_SEGMENT_YOGA = 'segmentYoga'
export const TYPE_CONTENT_SEGMENT_FITNESS = 'segmentFitness'
export const TYPE_CONTENT_SEGMENT_MEDITATION = 'segmentMeditation'
export const TYPE_CONTENT_SERIES = 'series'
export const TYPE_CONTENT_SERIES_YOGA = 'seriesYoga'
export const TYPE_CONTENT_SERIES_FITNESS = 'seriesFitness'
export const TYPE_CONTENT_SERIES_MEDITATION = 'seriesMeditation'
export const TYPE_CONTENT_SERIES_LINK = 'seriesLink'
export const TYPE_CONTENT_SEGMENTED = 'series'
export const TYPE_CONTENT_SEGMENTED_YOGA = 'seriesYoga'
export const TYPE_CONTENT_SEGMENTED_FITNESS = 'seriesFitness'
export const TYPE_CONTENT_SEGMENTED_MEDITATION = 'seriesMeditation'
export const TYPE_CONTENT_ARTICLE = 'article'
export const TYPE_CONTENT_UNKNOWN = 'unknown'

// Product Types
export const TYPE_PRODUCT_SINGLE = 'single'
export const TYPE_PRODUCT_EPISODE = 'episode'
export const TYPE_PRODUCT_EPISODIC = 'episodic'
export const TYPE_PRODUCT_SEGMENT = 'segment'
export const TYPE_PRODUCT_SEGMENTED = 'segmented'
export const TYPE_PRODUCT_NONE = 'none'
export const TYPE_PRODUCT_UNKNOWN = 'unknown'

// Display Types
export const TYPE_DISPLAY_NORMAL = 'normal'
export const TYPE_DISPLAY_YOGA = 'yoga'
export const TYPE_DISPLAY_FITNESS = 'fitness'

// CMS Types
export const TYPE_CMS_NODE = 'node'
export const TYPE_CMS_TERM = 'term'

// Placeholder Types
export const TYPE_PLACEHOLDER = 'placeholder'

// video, series or article
export function getRealContentType (nodeData) {
  const type = _get(nodeData, 'type', '')
  let contentType
  if (_isObject(type)) {
    contentType = _get(type, 'content', '')
  } else {
    contentType = _toString(type).replace('product_', '')
  }

  switch (contentType) {
    case 'series':
      return TYPE_CONTENT_SERIES
    case 'video':
      return TYPE_CONTENT_VIDEO
    default:
      return TYPE_CONTENT_UNKNOWN
  }
}

// episode, segment or single (for videos)
// episodic of segmented (for series)
export function getRealProductType (nodeData) {
  const contentType = getRealContentType(nodeData)

  const type = _get(nodeData, 'type', '')
  let productType
  if (_isObject(type)) {
    productType = _get(type, 'product', '')
  } else {
    productType = _get(nodeData, 'product_type', '')
  }

  if (contentType === 'series') {
    switch (productType) {
      case 'segmented':
        return TYPE_PRODUCT_SEGMENTED
      case 'episodic':
      default:
        return TYPE_PRODUCT_EPISODIC
    }
  } else {
    switch (productType) {
      case 'episode':
        return TYPE_PRODUCT_EPISODE
      case 'segment':
        return TYPE_PRODUCT_SEGMENT
      case 'single':
      default:
        return TYPE_PRODUCT_SINGLE
    }
  }
}

// yoga, fitness or normal
export function getRealDisplayType (nodeData) {
  const type = _get(nodeData, 'type', '')
  let displayType
  if (_isObject(type)) {
    displayType = _get(type, 'display', '')
  } else {
    displayType = _get(nodeData, 'display_type', '')
  }

  switch (displayType) {
    case 'yoga':
      return TYPE_DISPLAY_YOGA
    case 'fitness':
      return TYPE_DISPLAY_FITNESS
    default:
      return TYPE_DISPLAY_NORMAL
  }
}

// The three "real" type functions are all that should exist.
// These others are legacy mess that should be cleaned up.

export function getImpressionType (data) {
  return getRealContentType(data)
}

export function getContentType (cmsType, data) {
  const type = _get(data, 'type', '')
  let rawType
  if (_isObject(type)) {
    rawType = [
      _get(type, 'content', ''),
      _get(type, 'product', ''),
      _get(type, 'display') || TYPE_DISPLAY_NORMAL,
    ]
  } else {
    rawType = [
      _toString(type).replace('product_', ''),
      _get(data, 'product_type', ''),
      _get(data, 'display_type') || TYPE_DISPLAY_NORMAL,
    ]
  }
  switch (cmsType) {
    case TYPE_CMS_NODE: {
      const isMeditation =
        _parseInt(_get(data, 'admin_category.tid', -1)) === 118946
      switch (rawType.join('-')) {
        case 'video-single-normal':
          return TYPE_CONTENT_VIDEO
        case 'video-single-yoga':
          return isMeditation
            ? TYPE_CONTENT_VIDEO_MEDITATION
            : TYPE_CONTENT_VIDEO_YOGA
        case 'video-single-fitness':
          return TYPE_CONTENT_VIDEO_FITNESS
        case 'video-episode-normal':
          return TYPE_CONTENT_EPISODE
        case 'video-episode-yoga':
          return isMeditation
            ? TYPE_CONTENT_EPISODE_MEDITATION
            : TYPE_CONTENT_EPISODE_YOGA
        case 'video-episode-fitness':
          return TYPE_CONTENT_EPISODE_FITNESS
        case 'video-segment-normal':
          return TYPE_CONTENT_SEGMENT
        case 'video-segment-yoga':
          return isMeditation
            ? TYPE_CONTENT_SEGMENT_MEDITATION
            : TYPE_CONTENT_SEGMENT_YOGA
        case 'video-segment-fitness':
          return TYPE_CONTENT_SEGMENT_FITNESS
        case 'series-episodic-normal':
          return TYPE_CONTENT_SERIES
        case 'series-episodic-yoga':
          return isMeditation
            ? TYPE_CONTENT_SERIES_MEDITATION
            : TYPE_CONTENT_SERIES_YOGA
        case 'series-episodic-fitness':
          return TYPE_CONTENT_SERIES_FITNESS
        case 'series-segmented-normal':
          return TYPE_CONTENT_SEGMENTED
        case 'series-segmented-yoga':
          return isMeditation
            ? TYPE_CONTENT_SEGMENTED_MEDITATION
            : TYPE_CONTENT_SEGMENTED_YOGA
        case 'series-segmented-fitness':
          return TYPE_CONTENT_SEGMENTED_FITNESS
        default:
          return TYPE_CONTENT_UNKNOWN
      }
    }
    case TYPE_CMS_TERM:
      return TYPE_CONTENT_SUBCATEGORY
    default:
      return TYPE_CONTENT_UNKNOWN
  }
}

export function getProductType (cmsType, data) {
  switch (cmsType) {
    case TYPE_CMS_NODE:
      switch (_get(data, 'product_type')) {
        case 'single':
          return TYPE_PRODUCT_SINGLE
        case 'episode':
          return TYPE_PRODUCT_EPISODE
        case 'episodic':
          return TYPE_PRODUCT_EPISODIC
        case 'segment':
          return TYPE_PRODUCT_SEGMENT
        case 'segmented':
          return TYPE_PRODUCT_SEGMENTED
        default:
          return TYPE_PRODUCT_NONE
      }
    case TYPE_CMS_TERM:
      return TYPE_PRODUCT_NONE
    default:
      return TYPE_PRODUCT_UNKNOWN
  }
}

export function isTypeVideo (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO:
      return true
    default:
      return false
  }
}

export function isTypeYogaFitnessVideo (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
      return true
    default:
      return false
  }
}

export function isTypeYogaVideo (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO_YOGA:
      return true
    default:
      return false
  }
}

export function isTypeMeditationVideo (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO_MEDITATION:
      return true
    default:
      return false
  }
}

export function isTypeFitnessVideo (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO_FITNESS:
      return true
    default:
      return false
  }
}

export function isTypeVideoAll (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO:
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
      return true
    default:
      return false
  }
}

export function isTypeEpisode (type) {
  switch (type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
      return true
    default:
      return false
  }
}

export function isTypeYogaFitnessEpisode (type) {
  switch (type) {
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return true
    default:
      return false
  }
}

export function isTypeYogaEpisode (type) {
  switch (type) {
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_SEGMENT_YOGA:
      return true
    default:
      return false
  }
}

export function isTypeMeditationEpisode (type) {
  switch (type) {
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return true
    default:
      return false
  }
}

export function isTypeFitnessEpisode (type) {
  switch (type) {
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_EPISODE_FITNESS:
      return true
    default:
      return false
  }
}

export function isTypeEpisodeAll (type) {
  switch (type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return true
    default:
      return false
  }
}

export function isYogaVideo (type) {
  switch (type) {
    case TYPE_CONTENT_VIDEO_YOGA:
      return true
    default:
      return false
  }
}

export function isTypeSeries (type) {
  switch (type) {
    case TYPE_CONTENT_SERIES:
      return true
    default:
      return false
  }
}

export function isTypeSeriesAll (type) {
  switch (type) {
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return true
    default:
      return false
  }
}

export function isTypeYogaFitnessSeries (type) {
  switch (type) {
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return true
    default:
      return false
  }
}
