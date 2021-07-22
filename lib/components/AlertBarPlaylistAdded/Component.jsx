import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Link from 'components/Link'

function AlertBarPlaylistAdded (props) {
  const { playlist, staticText } = props

  let messageAdded = ''
  let messageNotAdded = ''

  const added = playlist.getIn(['status', 'added'])
  const notAdded = playlist.getIn(['status', 'notAdded'])

  if (added.size > 2) {
    messageAdded = `${added.size} ${staticText.getIn(['data', 'items'])} ${staticText.getIn(['data', 'were'])} ${staticText.getIn(['data', 'added'])}`
  } else if (added.size > 0) {
    messageAdded = `${added.join(', ')} ${staticText.getIn(['data', 'was'])} ${staticText.getIn(['data', 'added'])}`
  }

  if (notAdded.size > 2) {
    messageNotAdded = `${notAdded.size} ${staticText.getIn(['data', 'items'])} ${staticText.getIn(['data', 'are'])} ${staticText.getIn(['data', 'notAdded'])}`
  } else if (notAdded.size > 0) {
    messageNotAdded = `${notAdded.join(', ')} ${staticText.getIn(['data', 'is'])} ${staticText.getIn(['data', 'notAdded'])}`
  }

  return (
    <div className="alert-bar-playlist">
      { messageAdded
        ? <span>{messageAdded} &nbsp;</span>
        : null
      }
      { messageNotAdded
        ? <span>{messageNotAdded}</span>
        : null
      } &nbsp;
      <Link
        to="/playlist"
        text={staticText.getIn(['data', 'viewPlaylist'])}
        className="alert-bar-link"
      />
    </div>
  )
}

AlertBarPlaylistAdded.propTypes = {
  playlist: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'alertBarPlaylistAdded' }),
)(AlertBarPlaylistAdded)
