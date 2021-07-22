import PropTypes from 'prop-types'
import React from 'react'
import TextSeason from 'components/TextSeason'
import TextEpisode from 'components/TextEpisode'

function getClassName (inputClassName) {
  return ['text-season-episode'].concat(inputClassName || []).join(' ')
}

function TextSeasonEpisode (props) {
  const season = props.season
  const episode = props.episode


  if (!season && !episode) {
    return null
  }
  return (
    <span className={getClassName(props.className)}>
      {season ? <TextSeason lang={props.lang} number={props.season} /> : null}
      {season && episode ? (
        <span className="text-season-episode__separator">:</span>
      ) : null}
      {episode ? (
        <TextEpisode lang={props.lang} number={props.episode} />
      ) : null}
    </span>
  )
}

TextSeasonEpisode.propTypes = {
  episode: PropTypes.number,
  season: PropTypes.number,
  className: PropTypes.array,
  lang: PropTypes.string,
}

export default React.memo(TextSeasonEpisode)
