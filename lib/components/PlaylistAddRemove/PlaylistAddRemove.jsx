import React from 'react'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Icon, { ICON_TYPES, ICON_STYLES } from 'components/Icon.v2'
import { TYPE_PLAYLIST_SELECT, TYPE_USER_PLAYLIST_ADD } from 'services/dialog'
import { connect as connectRedux } from 'react-redux'
import { Button, TYPES } from 'components/Button.v2'
import UniqueId from 'components/UniqueId'
import { PLAYLIST_ADD } from 'services/event-tracking'
import { getBoundActions } from 'actions'
import ToolTip from 'components/ToolTip'
import { get as getConfig } from 'config'

const config = getConfig()

class PlaylistAddRemove extends React.Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      showAddRemoveIcon: false,
    }
  }

  componentDidMount () {
    const { props } = this
    const { getPlaylistItem, contentId, uniqueId } = props
    getPlaylistItem({
      componentId: uniqueId,
      contentId,
    })
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { removePlaylistItem, getPlaylistItem, contentId, uniqueId } = props
    const { contentId: prevContentId } = prevProps
    if (contentId !== prevContentId) {
      removePlaylistItem({
        contentId: prevContentId,
        componentId: uniqueId,
      })
      getPlaylistItem({
        componentId: uniqueId,
        contentId,
      })
    }
  }

  componentWillUnmount () {
    const { props } = this
    const { removePlaylistItem, contentId, uniqueId } = props
    removePlaylistItem({
      componentId: uniqueId,
      contentId,
    })
  }

  onReturnFocus = () => {
    if (this.$el && this.$el.querySelector) {
      const btn = this.$el.querySelector('.button')
      if (btn) {
        btn.focus()
      }
    }
  }

  onModalSelect = (type, add, contentId, name) => {
    this.updatePlaylistItem(type, add, contentId, name)
  }

  onClick = () => {
    const { props } = this
    const { hasPortal, merchEventData, setDefaultGaEvent } = props

    if (config.features.multiplePlaylists) {
      this.openUserPlaylistsModal()
      return
    }
    if (hasPortal) {
      this.openModal()
      return
    }
    const { meta, contentId } = props
    const add = !meta.get('inPlaylist')
    if (merchEventData && add) {
      const eventData = merchEventData.set('eventAction', PLAYLIST_ADD)
      setDefaultGaEvent(eventData)
    }

    this.updatePlaylistItem('default', add, contentId)
  }

  onRef = (el) => {
    this.$el = el
  }

  getLabel () {
    const { props } = this
    const { staticText, reverse, meta, circlularIcon, noText } = props
    const inPlaylist = meta.get('inPlaylist', false)
    const text = inPlaylist
      ? staticText.getIn(['data', 'removeFromPlaylist'])
      : staticText.getIn(['data', 'addToPlaylist'])
    const type = inPlaylist ? ICON_TYPES.MINUS : ICON_TYPES.PLUS
    const icon = circlularIcon ? null : <Icon style={ICON_STYLES.OUTLINE} type={type} />
    const span = !noText ? <span className="playlist-add__label">{text}</span> : null
    return (
      <React.Fragment>
        { reverse ? span : icon }
        { reverse ? icon : span }
      </React.Fragment>
    )
  }

  getClass () {
    const { props } = this
    const { className, notext, reverse, circlularIcon } = props
    const cls = circlularIcon ? ['playlist-add playlist-add__circular'] : ['playlist-add']
    if (reverse) cls.push('playlist-add--reverse')
    if (notext) cls.push('playlist-add--notext')
    if (className) cls.push(className)
    return cls.join(' ')
  }

  updatePlaylistItem (type, add, contentId, name) {
    const { props } = this
    const { updatePlaylistItem } = props

    if (add) {
      const { setEventPlaylistVideoAdded } = props
      setEventPlaylistVideoAdded({
        upstreamContext: props.upstreamContext,
        id: contentId,
      })
    }
    updatePlaylistItem({
      contentId,
      type,
      add,
      name,
    })
  }

  removePlaylistSelectModal = () => {
    const { props } = this
    const { dismissModal, getPlaylistItem, contentId, uniqueId } = props
    getPlaylistItem({
      componentId: uniqueId,
      contentId,
    })
    dismissModal()
  }

  openModal () {
    const { props, onReturnFocus, onModalSelect } = this
    const { staticText, renderModal, contentId, meta } = props
    renderModal(TYPE_PLAYLIST_SELECT, {
      title: staticText.getIn(['data', 'selectPlaylists']),
      className: 'playlist-add__modal',
      onSelect: onModalSelect,
      onReturnFocus,
      staticText,
      contentId,
      meta,
    })
  }

  openUserPlaylistsModal () {
    const { props, onReturnFocus, onModalSelect } = this
    const { staticText, renderModal, contentId, meta, hasPortal } = props
    renderModal(TYPE_USER_PLAYLIST_ADD, {
      onSelect: onModalSelect,
      onReturnFocus,
      hasPortal: !!hasPortal,
      staticText,
      contentId,
      meta,
    })
  }

  shouldShowToolTip = (hovered, props) => {
    const { contentId, hiddenContentInfo } = props
    const dataReady = hiddenContentInfo.size > 0

    if (hovered === false) {
      return this.setState({ showAddRemoveIcon: false })
    }

    if (dataReady) {
      const hideToolTip = !!hiddenContentInfo.getIn(['content']).find((el) => {
        return (el.get('contentId') === contentId)
      })
      if (hideToolTip) {
        return this.setState({ showAddRemoveIcon: false })
      }
    }
    return this.setState({ showAddRemoveIcon: true })
  }

  render () {
    const { props } = this
    const { error, meta, circlularIcon, staticText, centerIcon } = props
    const inPlaylist = meta.get('inPlaylist', false)
    const iconClass = inPlaylist ? ['icon-v2 icon-v2--circular-remove'] : ['icon-v2 icon-v2--circular-add']
    const toolTipAddRemoveText = inPlaylist ?
      staticText.getIn(['data', 'removeFromPlaylist']) :
      staticText.getIn(['data', 'addToPlaylist'])
    return (
      <div
        className={this.getClass()}
        ref={this.onRef}
      >
        { circlularIcon ?
          <span className={centerIcon ? 'playlist-add__circular--add-remove' : null}>
            {
              this.props.toolTipEnabled ? <ToolTip
                visible={this.state.showAddRemoveIcon}
                containerClassName={['tool-tip__inner--add-remove']}
                className={['tool-tip__outer tool-tip__outer--add-remove']}
                arrowClassName={['tool-tip__arrow--center-bottom']}
              > { toolTipAddRemoveText }
              </ToolTip> :
                null
            }
            <Button
              className="playlist-add__cta button--with-icon playlist-add__cta--add-remove"
              onClick={this.onClick}
              type={TYPES.GHOST}
              disabled={error || !meta.size}
              iconClass={iconClass}
              setHovered={hovered => this.shouldShowToolTip(hovered, props)}
            >{this.getLabel()}
            </Button>
          </span>
          :
          <Button
            className="playlist-add__cta"
            onClick={this.onClick}
            type={TYPES.GHOST}
            disabled={error || !meta.size}
          >{this.getLabel()}
          </Button>
        }
      </div>
    )
  }
}

PlaylistAddRemove.propTypes = {
  setEventPlaylistVideoAdded: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
  uniqueId: PropTypes.string.isRequired,
  className: PropTypes.string,
  reverse: PropTypes.bool,
  notext: PropTypes.bool,
  contentId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
}

export default compose(
  UniqueId('playlist-add'),
  connectRedux(
    (state, { contentId }) => {
      const { user, playlist, staticText: text, hiddenContentPreferences } = state
      const hiddenContentInfo = hiddenContentPreferences
      const staticText = text.getIn(['data', 'playlistAddRemove'], Map())
      const error = playlist.getIn(['items', contentId, 'error'], false)
      const meta = playlist.getIn(['items', contentId, 'data'], Map())
      const hasPortal = user.getIn(['data', 'portal', 'url'], '')
      return { staticText, hasPortal, error, meta, hiddenContentInfo }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setEventPlaylistVideoAdded: actions.eventTracking.setEventPlaylistVideoAdded,
        updatePlaylistItem: actions.playlist.updatePlaylistItem,
        removePlaylistItem: actions.playlist.removePlaylistItem,
        getPlaylistItem: actions.playlist.getPlaylistItem,
        renderModal: actions.dialog.renderModal,
        dismissModal: actions.dialog.dismissModal,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(PlaylistAddRemove)
