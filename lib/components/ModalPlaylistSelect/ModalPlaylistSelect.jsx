import { List } from 'immutable'
import FormsyForm from 'formsy-react'
import React, { useCallback, useState, useEffect } from 'react'
import { Checkbox } from 'components/FormInput.v2'
import { connect as connectRedux } from 'react-redux'

function ModalPlaylistSelect (props = {}) {
  const { onSelect, meta, staticText, contentId, error } = props
  const playlists = meta.get('playlists', List())
  const isInPortal = !!playlists.find(pl => pl.get('playlistType') === 'portal')
  const isInDefault = !!playlists.find(pl => pl.get('playlistType') === 'default')

  const [portalState, setPortalState] = useState(isInPortal)
  const [playlistState, setPlaylistState] = useState(isInDefault)

  useEffect(() => {
    if (error && portalState) {
      setPortalState(false)
    }
  }, [portalState, error])

  const onChangePortal = useCallback((name, checked) => {
    setPortalState(checked)
    onSelect(name, checked, contentId)
  }, [])

  const onChangePlaylist = useCallback((name, checked) => {
    setPlaylistState(checked)
    onSelect(name, checked, contentId)
  }, [])

  return (
    <div>
      <FormsyForm>
        <Checkbox
          label={staticText.getIn(['data', 'portalLabel'])}
          onChange={onChangePortal}
          value={portalState}
          htmlValue="portal"
          name="portal"
          block
        />
        <Checkbox
          className="playlist-add__modal--no-padding"
          label={staticText.getIn(['data', 'playlistLabel'])}
          onChange={onChangePlaylist}
          value={playlistState}
          htmlValue="playlist"
          name="default"
          block
        />
      </FormsyForm>
    </div>
  )
}

export default connectRedux(
  (state, props) => {
    const { playlist } = state
    const { contentId } = props
    const error = playlist.getIn(['items', contentId, 'error'], false)
    return { error }
  },
)(ModalPlaylistSelect)

