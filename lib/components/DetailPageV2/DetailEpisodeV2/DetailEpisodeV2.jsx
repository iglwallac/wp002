import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { TYPE_CONTENT_EPISODE } from 'services/content-type'
import _get from 'lodash/get'
import DetailJumbotron from 'components/DetailPageV2/DetailJumbotron'
import DetailRelatedVideos from 'components/DetailPageV2/DetailRelatedVideos'
import { connect as connectTiles } from 'components/Tiles/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import {
  STORE_KEY_EPISODE_DETAIL_NEXT,
  STORE_KEY_DETAIL_EPISODE_RELATED,
} from 'services/store-keys'
import { TYPE_NEXT_EPISODE, TYPE_RELATED } from 'services/tiles'
import { ANIMATION_STATES } from 'services/shelf/constants'
import FloatingActionToolbar from 'components/DetailPageV2/FloatingActionToolbar'
import DetailMetadata from 'components/DetailPageV2/DetailMetadata'

function DetailEpisodeV2 (props) {
  const { location, detail, staticText } = props
  const urlChanged = _get(location, ['pathname']) !== detail.get('path')

  const [openShelfRowId, setOpenShelfRowId] = useState(null)

  const setShelfOpen = (rowId) => {
    setOpenShelfRowId(rowId)
  }

  const clearOpenShelfRowId = () => {
    setShelfOpen(null)
  }

  const resetShelf = () => {
    const { setShelfAnimationState, setShelfVisibleId, resetTileRowsActiveRow } = props

    setShelfAnimationState(ANIMATION_STATES.NONE)
    setShelfVisibleId(null, false)
    resetTileRowsActiveRow('hover-row')
    setShelfOpen(null)
  }

  const onComponentUnmount = () => {
    return () => {
      // reset shelf
      resetShelf()
    }
  }

  // use hook like componentDidUpdate
  // watches urlChanged
  useEffect(resetShelf, [urlChanged])

  // use hook like componentWillUnmount
  useEffect(onComponentUnmount, [])

  return (
    <article className="detail-episode-V2">
      <DetailJumbotron
        type={TYPE_CONTENT_EPISODE}
        titleSeparator={staticText.getIn(['data', 'with'])}
      />
      <div className="detail-episode-V2__content">
        <FloatingActionToolbar type={TYPE_CONTENT_EPISODE} />
        <DetailMetadata type={TYPE_CONTENT_EPISODE} />
        <DetailRelatedVideos
          storeKey={STORE_KEY_DETAIL_EPISODE_RELATED}
          location={location}
          clearOpenShelfRowId={clearOpenShelfRowId}
          setShelfOpen={setShelfOpen}
          openShelfRowId={openShelfRowId}
        />
      </div>
    </article>
  )
}

DetailEpisodeV2.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setShelfAnimationState: PropTypes.func.isRequired,
  setShelfVisibleId: PropTypes.func.isRequired,
  resetTileRowsActiveRow: PropTypes.func.isRequired,
}

export default compose(
  connectTiles({
    storeKey: STORE_KEY_EPISODE_DETAIL_NEXT,
    type: TYPE_NEXT_EPISODE,
    attachProps: false,
    seriesLink: true,
    enablePageBehaviors: true,
  }),
  connectTiles({
    storeKey: STORE_KEY_DETAIL_EPISODE_RELATED,
    type: TYPE_RELATED,
    attachProps: false,
    enablePageBehaviors: true,
  }),
  connectStaticText({ storeKey: 'detailEpisodeV2' }),
  connectRedux(
    (state) => {
      return {
        detail: state.detail,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setShelfAnimationState: actions.shelf.setShelfAnimationState,
        setShelfVisibleId: actions.shelf.setShelfVisibleId,
        resetTileRowsActiveRow: actions.tileRows.resetTileRowsActiveRow,
      }
    },
  ),
)(DetailEpisodeV2)
