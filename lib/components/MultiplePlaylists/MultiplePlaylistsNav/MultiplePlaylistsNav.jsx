import React, { useEffect, useRef, useState } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import { List, Map } from 'immutable'
import pick from 'lodash/pick'
import { BASE_PLAYLISTS } from 'services/playlist'
import { TYPE_USER_PLAYLIST_ADD } from 'services/dialog'
import { H3, HEADING_TYPES } from 'components/Heading'
import IconV2, { ICON_TYPES, ICON_STYLES } from 'components/Icon.v2'
import Link from 'components/Link'
import { Button } from 'components/Button.v2'

const MAX_WIDTH_COLLAPSIBLE_MENU = 944

const getClassItem = (activeItem, type, baseClass, isUserPl = false) => {
  const classes = [baseClass]
  if (activeItem.get('type') === type) {
    classes.push(`${baseClass}--selected`)
  }
  if (isUserPl) {
    classes.push(`${baseClass}--user`)
  }
  return classes.join(' ')
}

const getClassContainer = (isExpanded, isMobile) => {
  const classes = ['multiple-playlists-nav']
  if (isExpanded && isMobile) {
    classes.push(`${classes[0]}--expanded`)
  }
  return classes.join(' ')
}


const MultiplePlaylistsNav = (props) => {
  const {
    navItems,
    activeItem,
    staticText,
    width,
    processingNewPlaylist,
    setActiveUserPlaylist,
    renderModal,
    resetNewPlaylistError,
  } = props
  const mobile = width < MAX_WIDTH_COLLAPSIBLE_MENU
  const [expanded, setExpanded] = useState(!mobile)
  const isOpenModal = useRef(false)

  useEffect(() => {
    // Collapse the menu if the window was resized to mobile.
    if (mobile && expanded) {
      setExpanded(false)
    }
  }, [mobile])

  useEffect(() => {
    // Re-render modal when processing in order to hide the close button.
    if (isOpenModal.current) {
      renderCreateNewPlaylistModal()
    }
  }, [processingNewPlaylist])

  const toggleExpandMenu = () => {
    setExpanded(!expanded)
  }

  const onClickNavItem = (playlist) => {
    setActiveUserPlaylist(pick(playlist, ['name', 'type']))
    setExpanded(false)
  }

  const onModalDismiss = () => {
    resetNewPlaylistError()
    isOpenModal.current = false
  }

  const renderCreateNewPlaylistModal = () => {
    renderModal(TYPE_USER_PLAYLIST_ADD, {
      onDismiss: onModalDismiss,
      hideDismiss: processingNewPlaylist,
      createOnly: true,
    })
    isOpenModal.current = true
  }

  const customPlaylistsItems = navItems.map((pl) => {
    const itemPath = `/playlist/${pl.get('type')}`
    return (
      <li
        className={getClassItem(activeItem, pl.get('type'), 'multiple-playlists-nav__item')}
        key={pl.get('id')}
      >
        <Link
          to={itemPath}
          onClick={() => onClickNavItem(pl.toJS())}
          className="multiple-playlists-nav__list-link"
        >
          <span className={getClassItem(activeItem, pl.get('type'), 'multiple-playlists-nav__list-text', true)}>
            {pl.get('name')}
          </span>
        </Link>
      </li>
    )
  })

  const basePlaylistsItems = BASE_PLAYLISTS.map((pl) => {
    const name = staticText.getIn(['data', pl.staticTextKey])
    return (
      <li
        className={getClassItem(activeItem, pl.type, 'multiple-playlists-nav__item')}
        key={pl.id}
      >
        <Link
          to={pl.url}
          onClick={() => onClickNavItem({ ...pl, name })}
          className="multiple-playlists-nav__list-link"
        >
          <IconV2 type={pl.iconType} />
          <span className={getClassItem(activeItem, pl.type, 'multiple-playlists-nav__list-text')}>
            {name}
          </span>
        </Link>
      </li>
    )
  })

  const renderDesktopTitle = () => (
    <div className="multiple-playlists-nav__heading multiple-playlists-nav__heading--desktop">
      <H3 as={HEADING_TYPES.H5}>
        {staticText.getIn(['data', 'playlistsTitle'])}
      </H3>
    </div>
  )

  const renderMobileTitle = () => (
    <div
      className="multiple-playlists-nav__heading multiple-playlists-nav__heading--mobile"
      onClick={toggleExpandMenu}
    >
      <H3 as={HEADING_TYPES.H5}>
        {expanded ? staticText.getIn(['data', 'playlistsTitle']) : activeItem.get('name')}
      </H3>
      <IconV2 type={expanded ? ICON_TYPES.CHEVRON_UP : ICON_TYPES.CHEVRON_DOWN} />
    </div>
  )

  return (
    <div className={getClassContainer(expanded, mobile)}>
      {mobile ? renderMobileTitle() : renderDesktopTitle()}
      <div className="multiple-playlists-nav__content">
        <ul className="multiple-playlists-nav__list">
          {basePlaylistsItems}
          <li className="multiple-playlists-nav__item multiple-playlists-nav__item--heading">
            <H3 as={HEADING_TYPES.H5}>
              {staticText.getIn(['data', 'customPlaylistsTitle'])}
            </H3>
          </li>
          <li className="multiple-playlists-nav__item multiple-playlists-nav__item--button">
            <Button className="multiple-playlists-nav__button" onClick={renderCreateNewPlaylistModal}>
              <IconV2
                className="multiple-playlists-nav__button-icon"
                type={ICON_TYPES.PLUS}
                style={ICON_STYLES.TEAL_CIRCLE}
              />
              <span className="multiple-playlists-nav__button-text">
                {staticText.getIn(['data', 'newPlaylist'])}
              </span>
            </Button>
          </li>
          {customPlaylistsItems}
        </ul>
      </div>
    </div>
  )
}

MultiplePlaylistsNav.propTypes = {
  navItems: ImmutablePropTypes.list.isRequired,
  activeItem: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  processingNewPlaylist: PropTypes.bool,
  width: PropTypes.number.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'multiplePlaylistsNav' }),
  connectRedux(
    state => ({
      navItems: state.playlist.getIn(['userPlaylists', 'data'], List()),
      activeItem: state.playlist.getIn(['userPlaylists', 'activePlaylist'], Map()),
      processingNewPlaylist: state.playlist.getIn(['userPlaylists', 'new', 'processing']),
      width: state.app.getIn(['viewport', 'width']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setActiveUserPlaylist: actions.playlist.setActiveUserPlaylist,
        resetNewPlaylistError: actions.playlist.resetNewUserPlaylistError,
        dismissModal: actions.dialog.dismissModal,
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
)(MultiplePlaylistsNav)
