import { Map } from 'immutable'
import PropTypes from 'prop-types'
import { truncate } from 'theme/web-app'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useMemo, useCallback, useState } from 'react'
import NotAvailable, { TYPE_NOT_AVAILABLE_OVERLAY } from 'components/NotAvailable'
import WatchAccess, { ACCESS_CHECK_AUTH_FEATURE_GEO } from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { getAuthIsLoggedIn } from 'services/auth'
import { H5 } from 'components/Heading'
import Row from 'components/Row.v2'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import { Button, TYPES } from 'components/Button.v2'

function getQuery (isMember, previewAvailable) {
  const featureOrPreview = isMember ? 'feature' : 'preview'
  return !isMember && !previewAvailable ? {} : { fullplayer: featureOrPreview }
}

function handleGaEvent (kind) {
  if (global.dataLayer) {
    global.dataLayer.push({
      event: 'customEvent',
      eventCategory: 'User Engagement',
      eventAction: 'carousel click',
      eventLabel: kind,
    })
  }
}

function handlePlay (onWatch, nid, kind) {
  onWatch(nid)
  handleGaEvent(kind)
}

// TODO: this will either need to open the shelf or
// create a link to the series page.
function createAccessor (Accessor, item) {
  if (!item) return null
  const url = item.get('url', '') || ''
  const title = item.get('title', '')
  return <Accessor title={title} to={url} />
}

function renderItem (item, params, props, onWatch) {
  const { openShelf, focused } = params
  const { auth, staticText, kind } = props
  if (!item) {
    return <div className="portal-playlist-v2__item" />
  }

  const preview = item.get('preview', Map())
  const feature = item.get('feature', Map())
  const isMember = getAuthIsLoggedIn(auth)
  const isFree = item.get('isFree')
  const title = item.get('title')
  const url = item.get('url')

  const previewAvailable = item.getIn(['preview', 'id'], -1) > -1
  const description = item.get('body')
  const image = item.get('imageWithText')
  const descriptionSplit = truncate(description, 100)

  const imageTag = (
    <img
      className="portal-playlist-v2__image"
      alt={title}
      src={image}
    />
  )

  return (
    <div className="portal-playlist-v2__item">
      <WatchAccess
        accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
        feature={feature}
        preview={preview}
        auth={auth}
      >
        <WatchAccessDenied>
          <NotAvailable
            message={staticText.get('notAvailableInRegion')}
            type={TYPE_NOT_AVAILABLE_OVERLAY}
          />
          {imageTag}
        </WatchAccessDenied>
        <WatchAccessAllowed>
          <Link
            onClick={isFree ? () => handlePlay(onWatch, item.get('nid'), kind) : () => handleGaEvent(kind)}
            query={getQuery(isMember, previewAvailable)}
            to={isFree ? '' : url}
          >
            {isFree ?
              <div className="portal-playlist-v2__free">
                {staticText.get('free')}
              </div> :
              null
            }
            {imageTag}
          </Link>
          {focused ?
            <div className="portal-playlist-v2__meta">
              <Link
                className="portal-playlist-v2__shelf-link"
                onClick={openShelf}
                to={URL_JAVASCRIPT_VOID}
              />
              <H5>{title}</H5>
              <p className="portal-playlist-v2__body">{descriptionSplit}</p>
              <div className="portal-playlist-v2__icon-wrapper">
                <Icon
                  className="portal-playlist-v2__icon"
                  type={ICON_TYPES.ARROW_DOWN}
                  onClick={openShelf}
                />
              </div>
            </div> :
            null
          }
        </WatchAccessAllowed>
      </WatchAccess>
    </div>
  )
}

export default function Playlist (props) {
  const {
    getPortalShare,
    ctaOnClick,
    ctaLabel,
    editable,
    setMode,
    portal,
    modes,
    light,
    label,
    items,
    auth,
  } = props

  const isPortalOwner = portal.get('isPortalOwner')

  const [shelfIsOpen, setShelfOpen] = useState(false)

  const vars = useMemo(() => ({
    className: shelfIsOpen
      ? `portal-playlist-v2 ${light ? 'portal-playlist-v2--light' : ''} portal-playlist-v2--open`
      : `portal-playlist-v2 ${light ? 'portal-playlist-v2--light' : ''}`,
  }), [shelfIsOpen, light])

  const onCloseShelf = useCallback(() => {
    setShelfOpen(false)
  }, [])

  const onOpenShelf = useCallback((openShelf, item) => {
    const contentType = item.getIn(['type', 'content'])
    const contentId = item.get('nid')
    openShelf(contentId, contentType)
    setShelfOpen(true)
  }, [shelfIsOpen])

  const onCreateFreeVideo = useCallback((contentId) => {
    getPortalShare({ contentId })
  }, [])

  const editPlaylist = useCallback(() => {
    setMode(modes.PLAYLIST_EDIT)
  }, [])

  return (
    <section className={vars.className}>
      <Row
        createAccessor={createAccessor}
        onCloseShelf={onCloseShelf}
        onOpenShelf={onOpenShelf}
        ctaOnClick={ctaOnClick}
        className="portal-playlist-v2__row"
        ctaLabel={ctaLabel}
        items={items}
        label={label}
        auth={auth}
        useShelfV1
        inverted
      >{(item, data) => renderItem(
          item, data, props, onCreateFreeVideo)}
      </Row>
      {isPortalOwner && editable ? (
        <div className="portal-playlist-v2__actions">
          <Button
            className="portal-playlist-v2__action-edit"
            type={TYPES.ICON_PRIMARY}
            icon={ICON_TYPES.PENCIL}
            onClick={editPlaylist}
            shadow
          />
        </div>
      ) : null}
    </section>
  )
}

Playlist.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  items: ImmutablePropTypes.list.isRequired,
  portal: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  label: PropTypes.string.isRequired,
  kind: PropTypes.string.isRequired,
  getPortalShare: PropTypes.func,
  ctaOnClick: PropTypes.func,
  ctaLabel: PropTypes.string,
  editable: PropTypes.bool,
  light: PropTypes.bool,
}
