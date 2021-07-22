import React, { useCallback, useState, useEffect } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import _parseInt from 'lodash/parseInt'
import { DndProvider } from 'react-dnd'
import PropTypes from 'prop-types'
import { List } from 'immutable'
import _join from 'lodash/join'
import _max from 'lodash/max'

import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES } from 'components/Button.v2'
import { H3 } from 'components/Heading'

import PlaylistItem from './PlaylistItem'
import VideoManager from './VideoManager'

const MAX_VIDEOS_LENGTH = 15

function getAddButtonClassName (hide) {
  const cls = ['portal-playlist-v2-edit__playlist-item-wrapper', 'portal-playlist-v2-edit__playlist-add-item-wrapper']

  if (hide) {
    cls.push('portal-playlist-v2-edit__playlist-add-item-wrapper--hide')
  }
  return _join(cls, ' ')
}

function PlaylistEdit ({
  reorderPlaylistItem,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  displayName,
  staticText,
  touchable,
  playlist,
  setMode,
  modes,
  auth,
}) {
  const savedVideos = playlist.get('videos', List())
  const [orderedVideos, setOrderedVideos] = useState(playlist.get('videos', List()))
  const [showVideoManager, setShowVideoManager] = useState(false)
  const [limitExceeded, setLimitExceeded] = useState(false)

  useEffect(() => {
    if (limitExceeded && orderedVideos.size < MAX_VIDEOS_LENGTH) {
      setLimitExceeded(false)
    }
  })

  // resets videos on lang change
  useEffect(() => {
    setOrderedVideos(savedVideos)
  }, [savedVideos])

  const handleRemoveItem = useCallback((id) => {
    const contentId = _parseInt(id)
    const removeIndex = orderedVideos.findIndex(video => video.get('id') === contentId)
    const updatedVideos = orderedVideos.remove(removeIndex)

    removeVideoFromPlaylist(contentId)
    setOrderedVideos(updatedVideos)
  }, [orderedVideos])

  const handleAddItem = useCallback((playlistItem) => {
    const contentId = _parseInt(playlistItem.get('nid'))
    const updatedVideos = orderedVideos.unshift(playlistItem)

    addVideoToPlaylist(contentId)
    setOrderedVideos(updatedVideos)
  }, [orderedVideos])

  const reorderVideos = useCallback((moveFromIndex, moveToIndex, movingItemId) => {
    const movingItem = orderedVideos.find(video => video.get('id') === movingItemId)
    const reorderedList = orderedVideos.splice(moveFromIndex, 1).splice(moveToIndex, 0, movingItem)

    setOrderedVideos(reorderedList)
  }, [orderedVideos])

  const handleReorder = useCallback((contentId, playlistPosition) => {
    const moveToIndex = orderedVideos.findIndex(video => video.get('playlistPosition') === playlistPosition)
    const moveFromIndex = orderedVideos.findIndex(video => video.get('id') === contentId)

    // Updates our locally tracked List of videos
    reorderVideos(moveFromIndex, moveToIndex, contentId)
    reorderPlaylistItem({
      playlistId: playlist.get('playlistUuid'),
      playlistPosition,
      contentId,
      auth,
    })
  }, [orderedVideos, reorderVideos, playlist])

  const togglePlaylistItem = (playlistItem, isInPlaylist) => {
    if (isInPlaylist) {
      return handleRemoveItem(playlistItem.get('nid'))
    }

    if (orderedVideos.size >= MAX_VIDEOS_LENGTH) {
      return setLimitExceeded(true)
    }
    const firstPosition = _max(orderedVideos.reduce((accum, data) => {
      return [...accum, data.get('playlistPosition')]
    }, []))

    return handleAddItem(playlistItem.set('playlistPosition', firstPosition + 1))
  }

  const titlePlaylistRecommended =
    staticText.get('titlePlaylistRecommended', '').replace(/\$\{displayName\}/, displayName)

  const onExit = useCallback(() => {
    setMode(modes.DEFAULT)
  }, [])

  const toggleShowVideoManager = useCallback(() => {
    setShowVideoManager(!showVideoManager)
  }, [showVideoManager])


  const hideAddButton = orderedVideos.size >= MAX_VIDEOS_LENGTH || showVideoManager
  return (
    <div className="portal-playlist-v2-edit">
      <div className="portal-playlist-v2-edit__content">
        <Button
          className="portal-playlist-v2-edit__button-back"
          type={TYPES.GHOST}
          onClick={onExit}
        >
          <Icon type={ICON_TYPES.CHEVRON_LEFT} />
          {staticText.get('buttonBack', '')}
        </Button>
        <H3>{staticText.get('editPlaylistTitle', '')}</H3>
        <div className="portal-playlist-v2-edit__body">
          <H3>{titlePlaylistRecommended}</H3>
          <p>{staticText.get('editRecommendedPlaylistDescription', '')}</p>
          <section className="portal-playlist-v2-edit__playlist">
            <DndProvider backend={touchable ? TouchBackend : HTML5Backend}>
              <div className="portal-playlist-v2-edit__playlist-items">
                {orderedVideos.map((item, index) => {
                  const id = item.get('nid', '')
                  return (
                    <PlaylistItem
                      text={staticText.get('freeForVisitors')}
                      onRemoveItem={handleRemoveItem}
                      onReorder={handleReorder}
                      playlistItem={item}
                      index={index}
                      key={id}
                      id={id}
                    />
                  )
                })}
                <div className={getAddButtonClassName(hideAddButton)}>
                  <div className="portal-playlist-v2-edit__playlist-item">
                    <a
                      href="#video-manager"
                      className="portal-playlist-v2-edit__playlist-add-item"
                      onClick={toggleShowVideoManager}
                    >
                      <Icon type={ICON_TYPES.PLUS} />
                    </a>
                  </div>
                </div>
              </div>
            </DndProvider>
          </section>
        </div>
      </div>
      {showVideoManager ? (
        <VideoManager
          playlistVideos={orderedVideos}
          staticText={staticText}
          close={toggleShowVideoManager}
          limitExceeded={limitExceeded}
          togglePlaylistItem={togglePlaylistItem}
          maxVideosLength={MAX_VIDEOS_LENGTH}
        />
      ) : null}
    </div>
  )
}

PlaylistEdit.defaultProps = {
  touchable: false,
}

PlaylistEdit.propTypes = {
  removeVideoFromPlaylist: PropTypes.func.isRequired,
  reorderPlaylistItem: PropTypes.func.isRequired,
  addVideoToPlaylist: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  updatePlaylistItem: PropTypes.func.isRequired,
  playlist: ImmutablePropTypes.map.isRequired,
  displayName: PropTypes.string.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  setMode: PropTypes.func.isRequired,
  modes: PropTypes.object.isRequired,
  touchable: PropTypes.bool,
}

export default PlaylistEdit
