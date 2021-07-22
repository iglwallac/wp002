import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { STORE_KEY_PLAYLIST_DEFAULT } from 'services/store-keys'
import { H1 } from 'components/Heading'

function getContainerClassName (sticky) {
  return ['playlist-header__container']
    .concat(sticky ? 'playlist-header__container--sticky' : [])
    .join(' ')
}

function renderSpacer (sticky) {
  if (!sticky) {
    return null
  }
  return <div className="playlist-header__spacer" />
}

class PlaylistHeader extends PureComponent {
  componentDidMount () {
    window.addEventListener('scroll', this.onWindowScroll)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.onWindowScroll)
  }

  onWindowScroll = () => {
    const { storeKey, playlist, setPlaylistHeaderSticky } = this.props
    const doc = document.documentElement
    const topTrigger = 170
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    const nextSticky = top >= topTrigger
    const sticky = playlist.getIn([storeKey, 'headerSticky'])
    if (sticky !== nextSticky) {
      setPlaylistHeaderSticky(storeKey, nextSticky)
    }
  }

  render () {
    const { props } = this
    const { storeKey, playlist, staticText, playlistEditLinkComponent } = props
    const sticky = playlist.getIn([storeKey, 'headerSticky'])
    return (
      <div className="playlist-header">
        {renderSpacer(sticky)}
        <div className={getContainerClassName(sticky)}>
          <div className="playlist-header__inner">
            <H1 className="playlist-header__title">
              {staticText.getIn(['data', 'myPlaylist'])}
            </H1>
            <div className="playlist-header__edit">
              {playlistEditLinkComponent}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

PlaylistHeader.propTypes = {
  storeKey: PropTypes.string,
  playlist: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setPlaylistHeaderSticky: PropTypes.func.isRequired,
  playlistEditLinkComponent: PropTypes.element.isRequired,
}

PlaylistHeader.defaultProps = {
  storeKey: STORE_KEY_PLAYLIST_DEFAULT,
}

export default reduxConnect(
  state => ({
    playlist: state.playlist,
    staticText: state.staticText.getIn(['data', 'playlistHeader']),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setPlaylistHeaderSticky: actions.playlist.setPlaylistHeaderSticky,
    }
  },
)(PlaylistHeader)
