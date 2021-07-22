import PropTypes from 'prop-types'
import React from 'react'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'

function getClassName (inputClassName) {
  return ['text-seasons-episodes'].concat(inputClassName || []).join(' ')
}

function TextSeasonsEpisodes (props) {
  const {
    episodeCount,
    seasonCount,
    className,
    hasSpaceBetweenSeperator,
    staticText,
  } = props

  if (!episodeCount && !seasonCount) {
    return null
  }

  const getSeason = () => {
    return (
      <React.Fragment>
        {`${seasonCount} `}
        {seasonCount > 1
          ? staticText.getIn(['data', 'seasons'])
          : staticText.getIn(['data', 'season'])}
      </React.Fragment>
    )
  }

  const getEpisode = () => {
    return (
      <React.Fragment>
        {`${episodeCount} `}
        {episodeCount > 1
          ? staticText.getIn(['data', 'episodes'])
          : staticText.getIn(['data', 'episode'])}
      </React.Fragment>
    )
  }

  return (
    hasSpaceBetweenSeperator ?
      <React.Fragment>
        <span className={getClassName(className)}>
          {getSeason()}
        </span>
        <span className={getClassName(className)}>
          {getEpisode()}
        </span>
      </React.Fragment>
      :
      <span className={getClassName(className)}>
        {getSeason()}{', '}{getEpisode()}
      </span>
  )
}

TextSeasonsEpisodes.propTypes = {
  episodeCount: PropTypes.number,
  seasonCount: PropTypes.number,
  className: PropTypes.array,
  hasSeperator: PropTypes.bool,
  episodeText: PropTypes.string,
  seasonText: PropTypes.string,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        staticText: state.staticText.getIn(['data', 'detailMetadata']),
      }
    },
  ),
  connectStaticText({ storeKey: 'textSeasonsEpisodes' }),
)(TextSeasonsEpisodes)

