import { PLAYLIST_TYPES, PLAYLIST_DROPDOWN_OPTIONS } from 'services/playlist'
import { Select } from 'components/FormInput.v2/FormInput'
import React, { useRef, useCallback } from 'react'
import FormsyForm from 'formsy-react'
import _values from 'lodash/values'
import { fromJS } from 'immutable'
import PropTypes from 'prop-types'
import _get from 'lodash/get'


function PlaylistDropdown ({
  currentFilter,
  handleSubmit,
}) {
  const currentOption = PLAYLIST_DROPDOWN_OPTIONS.find(o => o.value === currentFilter)
  const defaultOption = PLAYLIST_DROPDOWN_OPTIONS.find(o => o.value === 'default')
  const formEl = useRef(null)

  const handleIsValid = useCallback(() => {
    const { playlistType } = formEl.current.getModel()
    const shouldFetchPlaylist = _values(PLAYLIST_TYPES).includes(playlistType)

    if (playlistType && shouldFetchPlaylist) {
      handleSubmit(playlistType)
    }
  }, [])

  return (
    <FormsyForm
      className="portal-playlist-v2-video_manager__playlist_select_form"
      onValid={handleIsValid}
      ref={formEl}
    >
      <Select
        className="portal-playlist-v2-video_manager__playlist_select"
        name="playlistType"
        label="Playlist"
        options={fromJS(PLAYLIST_DROPDOWN_OPTIONS)}
        value={_get(currentOption, 'value') || defaultOption.value}
      >
        {PLAYLIST_DROPDOWN_OPTIONS.map(({ label, value }) => {
          const isDefault = value === 'default'
          return (
            <option hidden={isDefault} disabled={isDefault} value={value} key={value}>
              {label}
            </option>
          )
        })}
      </Select>
    </FormsyForm>
  )
}

PlaylistDropdown.propTypes = {
  currentFilter: PropTypes.string,
  handleSubmit: PropTypes.func,
}

export default PlaylistDropdown
