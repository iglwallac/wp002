import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import DetailJumbotron from 'components/DetailPageV2/DetailJumbotron'
import DetailRelatedVideos from 'components/DetailPageV2/DetailRelatedVideos'
import _get from 'lodash/get'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { connect as connectTiles } from 'components/Tiles/connect'
import {
  STORE_KEY_DETAIL_VIDEO_RELATED,
} from 'services/store-keys'
import { TYPE_CONTENT_VIDEO } from 'services/content-type'
import { TYPE_RELATED } from 'services/tiles'
import { ANIMATION_STATES } from 'services/shelf/constants'
import FloatingActionToolbar from 'components/DetailPageV2/FloatingActionToolbar'
import DetailMetadata from 'components/DetailPageV2/DetailMetadata'

function DetailVideoV2 (props) {
  const { location, detail } = props
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
    <article className="detail-video-V2">
      <DetailJumbotron type={TYPE_CONTENT_VIDEO} />
      <div className="detail-video-V2__content">
        <FloatingActionToolbar type={TYPE_CONTENT_VIDEO} />
        <DetailMetadata type={TYPE_CONTENT_VIDEO} />
        <DetailRelatedVideos
          storeKey={STORE_KEY_DETAIL_VIDEO_RELATED}
          location={location}
          clearOpenShelfRowId={clearOpenShelfRowId}
          setShelfOpen={setShelfOpen}
          openShelfRowId={openShelfRowId}
        />
      </div>
    </article>
  )
}

DetailVideoV2.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

export default compose(
  connectTiles({
    storeKey: STORE_KEY_DETAIL_VIDEO_RELATED,
    type: TYPE_RELATED,
    attachProps: false,
    enablePageBehaviors: true,
  }),
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
)(DetailVideoV2)
