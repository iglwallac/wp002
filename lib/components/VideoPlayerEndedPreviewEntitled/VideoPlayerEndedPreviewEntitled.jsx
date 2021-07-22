import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { partial as _partial } from 'lodash'
import { TYPE_EXACT } from 'services/tiles'
import { STORE_KEY_VIDEO_PLAYER_END_STATE } from 'services/store-keys'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import Tile from 'components/Tile'
import { H5, HEADING_TYPES } from 'components/Heading'

function getTilesState (storeKey, props) {
  return props.tiles.get(storeKey, Map())
}

function renderTile (tileData, props) {
  if (!tileData) {
    return null
  }

  return (
    <Tile
      tileClass="video-player-ended-preview-entitled__tile"
      auth={props.auth}
      tileData={tileData}
      showMoreInfo={false}
      single
    />
  )
}

function renderPlaylistAddRemove (tileData, props) {
  if (!tileData) {
    return null
  }

  const id = props.video.getIn(['data', 'id'])
  const inPlaylist = tileData.getIn(['userInfo', 'playlist'], false)
  const playlistAddRemoveClick = _partial(
    props.setTileDataUserPlaylist,
    STORE_KEY_VIDEO_PLAYER_END_STATE,
    id,
    !inPlaylist,
    props.auth.get('jwt'),
  )

  return (
    <PlaylistAddRemove
      className={['video-player-ended-preview-entitled__playlist-add-remove']}
      inPlaylist={inPlaylist}
      onClick={playlistAddRemoveClick}
    />
  )
}

class VideoPlayerEndedPreviewEntitled extends Component {
  componentDidMount () {
    const props = this.props
    const { language } = props
    const tilesState = getTilesState(
      STORE_KEY_VIDEO_PLAYER_END_STATE,
      this.props,
    )
    const tileStateId = tilesState.getIn(['data', 'id'])
    const videoId = this.props.video.getIn(['data', 'id'])
    if (
      !tilesState.get('processing') &&
      (!tilesState.get('data') || videoId !== tileStateId)
    ) {
      props.getTitlesDataUserInfo(
        STORE_KEY_VIDEO_PLAYER_END_STATE,
        [videoId],
        this.props.auth.get('jwt'),
      )
      props.getTilesData(
        STORE_KEY_VIDEO_PLAYER_END_STATE,
        videoId,
        Map({ type: TYPE_EXACT, language }),
        0,
        1,
        null,
        this.props.location,
      )
    }
  }

  render () {
    const props = this.props
    const { staticText } = props
    const tilesState = getTilesState(STORE_KEY_VIDEO_PLAYER_END_STATE, props)
    const tileData = tilesState.getIn(['data', 'titles', 0], null)
    const tile = renderTile(tileData, props)
    const playlistAddRemove = renderPlaylistAddRemove(tileData, props)

    return (
      <div className="video-player-ended-preview-entitled video-player-ended__preview">
        <H5 as={HEADING_TYPES.H6} inverted>
          {staticText.getIn(['data', 'watchTheFullVideo'])}
        </H5>
        {tile}
        {playlistAddRemove}
      </div>
    )
  }
}

VideoPlayerEndedPreviewEntitled.propTypes = {
  video: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  getTilesData: PropTypes.func.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  setTileDataUserPlaylist: PropTypes.func.isRequired,
  getTitlesDataUserInfo: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(
  state => ({
    tiles: state.tiles,
    auth: state.auth,
    staticText: state.staticText.getIn([
      'data',
      'videoPlayerEndedPreviewEntitled',
    ]),
  }),
  (dispatch) => {
    const tilesActions = getBoundActions(dispatch).tiles

    return {
      getTilesData: tilesActions.getTilesData,
      setTileDataUserPlaylist: tilesActions.setTileDataUserPlaylist,
      getTitlesDataUserInfo: tilesActions.getTitlesDataUserInfo,
    }
  },
)(VideoPlayerEndedPreviewEntitled)
