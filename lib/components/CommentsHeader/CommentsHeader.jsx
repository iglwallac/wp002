import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import CommentEdit from 'components/CommentEdit'
import TextSeasonEpisode from 'components/TextSeasonEpisode'
import { formatSeriesHost } from 'theme/web-app'
import { connect } from 'react-redux'
import { H5, H6, HEADING_TYPES } from 'components/Heading'


function getIsSeries (data) {
  const product = data.getIn(['type', 'product'])
  return product === 'episode' || product === 'segment'
}

function renderHeaderText (props) {
  const { data } = props
  const title = data.get('title')
  const isSeries = getIsSeries(data)

  // series-like
  if (isSeries) {
    const seriesTitle = data.get('seriesTitle')
    const episode = data.get('episode')
    const season = data.get('season')
    const host = data.get('host')
    if (episode && season) {
      return (
        <div>
          <H5 as={HEADING_TYPES.H6} className="comments-header__title">{title}</H5>
          <div className="comments-header__series-title">
            {formatSeriesHost(seriesTitle, host)}
          </div>
          <TextSeasonEpisode
            className={['comments-header__text-season-episode']}
            episode={episode}
            season={season}
          />
        </div>
      )
    }
    return (
      <div>
        <H5 as={HEADING_TYPES.H6} className="comments-header__title">{title}</H5>
        <div className="comments-header__series-title">
          {formatSeriesHost(seriesTitle, host)}
        </div>
      </div>
    )
  }
  return <H6 className="comments-header__title">{title}</H6>
}

function CommentsHeader (props) {
  const { auth, data, saveComment, commentsHeaderStaticText } = props
  if (!data) {
    return (
      <header className="comments-header">
        <H6 className="comments-header__title">
          {commentsHeaderStaticText.getIn(['data', 'comments'])}
        </H6>
      </header>
    )
  }
  return (
    <header className="comments-header">
      {renderHeaderText(props)}
      <CommentEdit auth={auth} data={data} saveComment={saveComment} />
    </header>
  )
}

CommentsHeader.propTypes = {
  data: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  saveComment: PropTypes.func.isRequired,
  commentsHeaderStaticText: ImmutablePropTypes.map.isRequired,
}

CommentsHeader.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(state => ({
  commentsHeaderStaticText: state.staticText.getIn(
    ['data', 'commentsHeader'],
    Map(),
  ),
}))(CommentsHeader)
