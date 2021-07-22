import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { H2, HEADING_TYPES } from 'components/Heading'
import IconV2, { ICON_TYPES, ICON_STYLES } from 'components/Icon.v2'
import Link from 'components/Link'


const MultiplePlaylistsEmpty = (props) => {
  const { staticText, playlistType } = props
  const textPostfix = playlistType === 'watch-history' ? 'WatchHistory' : ''
  const copyStart = staticText.getIn(['data', `bodyFirst${textPostfix}`])
  const copyEnd = staticText.getIn(['data', `bodySecond${textPostfix}`])

  return (
    <div className="multiple-playlist-empty">
      <div className="multiple-playlist-empty__image" />
      <div className="multiple-playlist-empty__text-container">
        <div className="multiple-playlist-empty__title">
          <H2 as={HEADING_TYPES.H5}>{staticText.getIn(['data', `title${textPostfix}`])}</H2>
        </div>
        <div className="multiple-playlist-empty__copy-container">
          <p className="multiple-playlist-empty__copy">
            {`${copyStart} `}
            {
              playlistType === 'watch-history'
                ? <Link className="multiple-playlist-empty__link" to="/">{staticText.getIn(['data', 'linkWatchHistory'])}</Link>
                : <IconV2 type={ICON_TYPES.PLUS} style={ICON_STYLES.OUTLINE} />
            }
            {` ${copyEnd}`}
          </p>
        </div>
      </div>
    </div>
  )
}

MultiplePlaylistsEmpty.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  playlistType: PropTypes.string,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'multiplePlaylistsEmpty']),
}))(MultiplePlaylistsEmpty)
