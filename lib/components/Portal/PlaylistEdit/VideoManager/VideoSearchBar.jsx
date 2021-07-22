import ImmutablePropTypes from 'react-immutable-proptypes'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import SearchForm from 'components/SearchForm'
import PropTypes from 'prop-types'
import React from 'react'

function VideoSearchBar ({
  handleSearch,
  staticText,
}) {
  return (
    <div className="portal-playlist-v2-video_search_bar">
      <Icon type={ICON_TYPES.SEARCH} />
      <SearchForm
        hideFilters
        noSearchRedirect
        onSubmit={handleSearch}
        placeholderText={staticText.get('videoSearchPlaceholder')}
      />
    </div>
  )
}

VideoSearchBar.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  handleSearch: PropTypes.func.isRequired,
}

export default VideoSearchBar
