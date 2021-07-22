import ImmutablePropTypes from 'react-immutable-proptypes'
import { SEARCH_CONTENT_TYPES } from 'services/search'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import React, { useCallback } from 'react'
import { H5 } from 'components/Heading'
import Pager from 'components/Pager.v2'
import { List, Map } from 'immutable'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import {
  getPlaylistEditFilter,
  getPlaylistEditSearch,
  updatePlaylistEditPagination,
} from 'services/portal/actions'
import PlaylistDropdown from './PlaylistDropdown'
import VideoSearchBar from './VideoSearchBar'
import PlaylistItem from './PlaylistItem'

const PAGINATION_LIMIT = 8

function getLoaderClassName (processing) {
  const base = 'portal-playlist-v2-edit__search-loading'
  const cls = [base]
  if (processing) {
    cls.push(`${base}--show`)
  }
  return cls.join(' ')
}

function getPlaylistItemsClassName (processing) {
  const base = 'portal-playlist-v2-edit__playlist-items'
  const cls = [base]
  if (processing) {
    cls.push(`${base}--processing`)
  }
  return cls.join(' ')
}

function VideoManager ({
  handleChangePlaylistFilter,
  togglePlaylistItem,
  updatePagination,
  maxVideosLength,
  playlistVideos,
  playlistEditor,
  searchContent,
  limitExceeded,
  staticText,
  close,
}) {
  const currentFilter = playlistEditor.get('filterType')
  const showLoader = playlistEditor.get('processing')
  const showPagination = playlistEditor.has('data') && playlistEditor.getIn(['data', 'totalCount']) > PAGINATION_LIMIT
  const total = parseInt(playlistEditor.getIn(['data', 'totalCount']), 10)
  const p = parseInt(playlistEditor.getIn(['data', 'currentPage']), 10)
  const titles = playlistEditor.getIn(['data', 'titles'], List())

  const handleSearch = useCallback((model) => {
    const searchTerm = _get(model, 'q', '')
    searchContent({
      searchTerm,
      contentType: SEARCH_CONTENT_TYPES.VIDEO,
      limit: PAGINATION_LIMIT,
    })
  }, [])

  const handlePageChange = useCallback((page) => {
    updatePagination({
      page,
      limit: PAGINATION_LIMIT,
    })
  }, [])

  const handlePlaylistFilterChange = useCallback((playlistType) => {
    handleChangePlaylistFilter({
      playlistType,
      limit: PAGINATION_LIMIT,
    })
  }, [])

  const renderTitles = () => {
    if (titles.size) {
      return titles.map((title) => {
        const nid = title.get('nid')
        const playlistIds = playlistVideos.map(v => v.get('nid'))
        const isInPlaylist = playlistIds.includes(nid)

        return (
          <PlaylistItem
            key={nid}
            playlistItem={title}
            isInPlaylist={isInPlaylist}
            togglePlaylistItem={togglePlaylistItem}
          />
        )
      })
    }

    if (!playlistEditor.get('processing')) {
      return <div className="portal-playlist-v2-video_manager__no-results"><H5>NO RESULTS</H5></div>
    }

    return null
  }

  return (
    <section id="video-manager" className="portal-playlist-v2-video_manager">
      <div className="portal-playlist-v2-video_manager__content">
        <header>
          <H5>{staticText.get('videoManagerTitle')}</H5>
          <a
            className="portal-playlist-v2-video_manager__close_button"
            onClick={close}
          >
            <Icon type={ICON_TYPES.CLOSE} />
          </a>
        </header>
        <div className="portal-playlist-v2-video_manager__controls">
          <VideoSearchBar
            staticText={staticText}
            handleSearch={handleSearch}
          />
          <PlaylistDropdown
            currentFilter={currentFilter}
            handleSubmit={handlePlaylistFilterChange}
          />
        </div>

        {limitExceeded ?
          <div className="portal-playlist-v2-video-manager__error">
            {staticText.get('errorExceededVideoLimit').replace(/\$\{maxVideosLength\}/, maxVideosLength)}
          </div>
          : null}
        <div className={getPlaylistItemsClassName(showLoader)}>
          <div className={getLoaderClassName(showLoader)}>
            <Sherpa type={TYPE_LARGE} />
          </div>
          {!playlistEditor.isEmpty() && renderTitles()}
        </div>
        {showPagination &&
          <Pager
            onChangePage={handlePageChange}
            total={total}
            pp={PAGINATION_LIMIT}
            p={p}
          /> }
      </div>
    </section>
  )
}

VideoManager.defaultProps = {
  playlistEditor: Map(),
}

VideoManager.propTypes = {
  handleChangePlaylistFilter: PropTypes.func.isRequired,
  playlistVideos: ImmutablePropTypes.list.isRequired,
  playlistEditor: ImmutablePropTypes.map.isRequired,
  togglePlaylistItem: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  maxVideosLength: PropTypes.number.isRequired,
  updatePagination: PropTypes.func.isRequired,
  limitExceeded: PropTypes.bool.isRequired,
  searchContent: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
}

export default connect(state => ({
  playlistEditor: state.portal.get('playlistEditor'),
  search: state.search,
}), {
  handleChangePlaylistFilter: getPlaylistEditFilter,
  updatePagination: updatePlaylistEditPagination,
  searchContent: getPlaylistEditSearch,
})(VideoManager)
