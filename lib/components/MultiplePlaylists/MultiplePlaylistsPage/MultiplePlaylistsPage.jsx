import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { getAuthIsLoggedIn } from 'services/auth'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'

import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import MultiplePlaylistsHeader from 'components/MultiplePlaylists/MultiplePlaylistsHeader'
import MultiplePlaylistsNav from 'components/MultiplePlaylists/MultiplePlaylistsNav'
import MultiplePlaylistsTiles from 'components/MultiplePlaylists/MultiplePlaylistsTiles'

const MultiplePlaylistsPage = (props) => {
  const {
    auth,
    playlist,
  } = props
  const isLoggedIn = getAuthIsLoggedIn(auth)
  const activePlaylist = playlist.getIn(['userPlaylists', 'activePlaylist'])

  // if not logged in or data is loading
  if (!isLoggedIn) {
    return (
      <div className="multiple-playlists">
        <Sherpa className={['multiple-playlists__sherpa']} type={TYPE_SMALL_BLUE} />
      </div>
    )
  }

  return (
    <div className="multiple-playlists">
      <MultiplePlaylistsNav />
      <div className="multiple-playlists__content">
        <MultiplePlaylistsHeader />
        {!activePlaylist ? null : <MultiplePlaylistsTiles />}
      </div>
    </div>
  )
}

MultiplePlaylistsPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  playlist: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connect(state => ({
    playlist: state.playlist,
  }),
  ),
)(MultiplePlaylistsPage)
