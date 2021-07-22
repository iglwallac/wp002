
import { ACCESS_PREVIEW } from 'components/WatchAccess'
import { Button, TYPES } from 'components/Button.v2'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import React, { useCallback, useState } from 'react'
import { H3 } from 'components/Heading'
import Row from 'components/Row.v2'
import PropTypes from 'prop-types'
import Tile from 'components/Tile'

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

function createAccessor (Accessor, item) {
  if (!item) return null
  const url = item.get('url', '') || ''
  const title = item.get('title', '')
  return <Accessor title={title} to={url} />
}

function renderItem (item, params, props, onWatch, kind) {
  if (!item) return null
  const { auth, staticText } = props
  const { openShelf } = params
  const isFree = item.get('isFree', false)
  return (
    <Tile
      inRow
      auth={auth}
      showMoreInfo
      isFree={isFree}
      tileData={item}
      asShare={isFree}
      staticText={staticText}
      forceAccess={ACCESS_PREVIEW}
      onClickMoreInfoFunc={openShelf}
      onClickWatch={isFree ? () => handlePlay(onWatch, item.get('nid'), kind) : () => handleGaEvent(kind)}
    />
  )
}

export default function ViewAll (props) {
//
  const {
    modes,
    items,
    kind,
    auth,
    setMode,
    staticText,
    getPortalShare,
  } = props

  const goBack = useCallback(() => {
    setMode(modes.DEFAULT)
  }, [modes, setMode])

  const [shelfIsOpen, setShelfOpen] = useState(false)

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
  }, [getPortalShare])

  return (
    <div className="portal-v2-view-all">
      <Button
        className="portal-v2-view-all__back"
        type={TYPES.GHOST}
        onClick={goBack}
      >
        <Icon type={ICON_TYPES.CHEVRON_LEFT} />
        {staticText.get('back')}
      </Button>
      <section className={`portal-v2-view-all ${shelfIsOpen ? 'portal-v2-view-all--open' : null}`}>
        <H3>{staticText.get('titleViewAll')}</H3>
        <div className="portal-v2-view-all__divider-line" role="presentation" />
        <Row
          createAccessor={createAccessor}
          onCloseShelf={onCloseShelf}
          onOpenShelf={onOpenShelf}
          items={items}
          auth={auth}
          useShelfV1
          inverted
          asGrid
        >{(item, data) => renderItem(
            item, data, props, onCreateFreeVideo, kind)}
        </Row>
      </section>
    </div>
  )
}


ViewAll.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  getPortalShare: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  modes: PropTypes.object.isRequired,
  kind: PropTypes.string.isRequired,
  items: ImmutablePropTypes.list,
  auth: ImmutablePropTypes.map,
}
