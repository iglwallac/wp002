import PropTypes from 'prop-types'
import React from 'react'
import {
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
} from 'services/content-type'
import { formatDuration } from 'theme/web-app'
import Link from 'components/Link'
import TextSeasonEpisode from 'components/TextSeasonEpisode'

export const META_POSITION_TOP = 'top'
export const META_POSITION_BOTTOM = 'bottom'
export const META_LOCATION_TILE_BANNER = 'tile-banner'

const metaItemClassName = 'meta__meta-item'

function formatSeriesHost (seriesTitle, host) {
  if (seriesTitle && host) {
    return (
      <span className="meta__series-host">{`${seriesTitle} with ${host}`}</span>
    )
  } else if (seriesTitle && !host) {
    return <span className="meta__series-host">{seriesTitle}</span>
  } else if (host && !seriesTitle) {
    return <span className="meta__series-host">{host}</span>
  }

  return null
}

function renderSeriesHost (props) {
  if (!props.seriesTitle && !props.host) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      if (props.seriesPath) {
        return (
          <Link className={metaItemClassName} to={props.seriesPath}>
            {formatSeriesHost(props.seriesTitle, props.host)}
          </Link>
        )
      }

      return (
        <span className={metaItemClassName}>
          {formatSeriesHost(props.seriesTitle, props.host)}
        </span>
      )
    default:
      return null
  }
}

function renderSeasonEpisode (props) {
  if (!props.episode && !props.season) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
      return (
        <span className={metaItemClassName}>
          <TextSeasonEpisode
            className={['meta__season-episode']}
            season={props.season}
            episode={props.episode}
          />
        </span>
      )
    default:
      return null
  }
}

function renderYear (props) {
  if (!props.year) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
      return <span className={metaItemClassName}>{props.year}</span>
    default:
      return null
  }
}

function renderGuest (props) {
  if (!props.guest) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
      return (
        <span className={metaItemClassName}>{`Guest: ${props.guest}`}</span>
      )
    default:
      return null
  }
}

function renderDuration (props) {
  if (!props.duration) {
    return null
  }

  return (
    <span className={metaItemClassName}>{formatDuration(props.duration)}</span>
  )
}

function renderYogaStyle (props) {
  if (!props.yogaStyle) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_SEGMENT_YOGA:
      return <span className={metaItemClassName}>{props.yogaStyle}</span>
    default:
      return null
  }
}

function renderYogaLevel (props) {
  if (!props.yogaLevel) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_SEGMENT_YOGA:
      return <span className={metaItemClassName}>{props.yogaLevel}</span>
    default:
      return null
  }
}

function renderFitnessStyle (props) {
  if (!props.fitnessStyle) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_SEGMENT_FITNESS:
      return <span className={metaItemClassName}>{props.fitnessStyle}</span>
    default:
      return null
  }
}

function renderFitnessLevel (props) {
  if (!props.fitnessLevel) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_SEGMENT_FITNESS:
      return <span className={metaItemClassName}>{props.fitnessLevel}</span>
    default:
      return null
  }
}

function renderMeditationStyle (props) {
  if (!props.meditationStyle) {
    return null
  }

  switch (props.type) {
    case TYPE_CONTENT_VIDEO_MEDITATION:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return <span className={metaItemClassName}>{props.meditationStyle}</span>
    default:
      return null
  }
}

function Meta (props) {
  if (props.metaPosition === META_POSITION_TOP) {
    return <div className="meta meta--top">{renderSeriesHost(props)}</div>
  }

  if (props.metaPosition === META_POSITION_BOTTOM) {
    return (
      <div className="meta meta--bottom">
        {renderSeasonEpisode(props)}
        {renderYogaStyle(props)}
        {renderYogaLevel(props)}
        {renderFitnessStyle(props)}
        {renderFitnessLevel(props)}
        {renderMeditationStyle(props)}
        {renderYear(props)}
        {renderDuration(props)}
        {renderGuest(props)}
      </div>
    )
  }

  return null
}

Meta.props = {
  type: PropTypes.string.isRequired,
  metaPosition: PropTypes.string.isRequired,
  metaLocation: PropTypes.string.isRequired,
  duration: PropTypes.number,
  episode: PropTypes.string,
  season: PropTypes.string,
  seriesTitle: PropTypes.string,
  seriesPath: PropTypes.string,
  host: PropTypes.string,
  guest: PropTypes.string,
  year: PropTypes.string,
  yogaStyle: PropTypes.string,
  yogaLevel: PropTypes.string,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
  meditationStyle: PropTypes.string,
}

export default Meta
