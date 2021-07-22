import React, { useCallback } from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import Icon from 'components/Icon'
import Link from 'components/Link'
import { fromJS } from 'immutable'
import _partial from 'lodash/partial'
import WatchAccessDenied from 'components/WatchAccessDenied'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccess, { ACCESS_PREVIEW, ACCESS_FEATURE } from 'components/WatchAccess'
import { MH_SPOTLIGHT_COLLAPSED_KEY } from 'services/feature-tracking'
import { isTypeSeriesAll } from 'services/content-type'
import { SERIES_CLICK, TITLE_CLICK, PLAY_EVENT, SPOTLIGHT_TOGGLE_EVENT } from 'services/event-tracking'
import { getTitleElementTypeByUrl, upstreamContextOnClick as upstreamContextClick } from 'services/upstream-context'

const PlayButton = (props) => {
  const { isSeries, isPublished, auth, preview, feature, url, onClick } = props

  return !isSeries && isPublished
    ? (
      <div className="spotlight-minized__play-action">
        <WatchAccess auth={auth} preview={preview} feature={feature}>
          <WatchAccessAllowed access={ACCESS_FEATURE}>
            <Link
              to={url}
              data-element="play-button"
              onClick={e => onClick(e, PLAY_EVENT)}
              query={{ fullplayer: 'feature' }}
            >
              <IconV2 type={ICON_TYPES.PLAY} className={'spotlight-minimized__play-icon'} />
            </Link>
          </WatchAccessAllowed>
          <WatchAccessAllowed access={ACCESS_PREVIEW}>
            <Link
              to={url}
              query={{ fullplayer: 'preview' }}
            >
              <Icon
                iconClass={['icon--play-fill', 'icon--white', 'spotlight-minimized__play-icon']}
              />
            </Link>
          </WatchAccessAllowed>
          <WatchAccessDenied>
            <Link to={url}>
              <Icon
                iconClass={['icon--play-fill', 'icon--white', 'spotlight-minimized__play-icon']}
              />
            </Link>
          </WatchAccessDenied>
        </WatchAccess>
      </div>
    )
    : null
}

const TitleLink = (props) => {
  const { isSeries, isPublished, title, url, onClick } = props
  const theTitle = title
  const theUrl = url
  const eventType = isSeries ? SERIES_CLICK : TITLE_CLICK
  return (
    <div className="spotlight-minimized__title">
      {isPublished ? (
        <Link
          to={theUrl}
          data-element={getTitleElementTypeByUrl(theUrl)}
          onClick={e => onClick(e, eventType)}
          title={theTitle}
        >
          {theTitle}
        </Link>
      ) : (
        <div>
          {theTitle}
        </div>
      )}
    </div>
  )
}

const getUpstreamContextOnClick = (props) => {
  const {
    upstreamContext,
    setUpstreamContext,
  } = props

  return _partial(
    upstreamContextClick,
    _partial.placeholder,
    { upstreamContext, setUpstreamContext },
  )
}

const SpotlightMinimized = (props) => {
  const upstreamContextOnClick = getUpstreamContextOnClick(props)
  const { data, auth, merchEventData, setDefaultGaEvent } = props
  const isPublished = data.get('published')
  const type = data.getIn(['type', 'content'])
  const isSeries = isTypeSeriesAll(type)
  const url = data.get('url')
  const title = data.get('title')
  const preview = data.get('preview')
  const feature = data.get('feature')
  const onExpand = useCallback(() => {
    props.setFeatureTrackingDataPersistent({
      data: fromJS({ [MH_SPOTLIGHT_COLLAPSED_KEY]: false }),
    })
    const eventData = SPOTLIGHT_TOGGLE_EVENT
      .set('eventLabel', 'on')
    setDefaultGaEvent(eventData)
  })
  const onClick = useCallback((e, eventName) => {
    if (merchEventData) {
      const eventData = merchEventData.set('eventAction', eventName)
      setDefaultGaEvent(eventData)
    }
    if (typeof upstreamContextOnClick === 'function') {
      upstreamContextOnClick(e)
    }
  })
  return (
    <div className="spotlight-minimized">
      <div className="spotlight-minimized__content">
        <PlayButton
          isSeries={isSeries}
          isPublished={isPublished}
          auth={auth}
          preview={preview}
          feature={feature}
          url={url}
          onClick={onClick}
        />
        <TitleLink
          isSeries={isSeries}
          isPublished={isPublished}
          title={title}
          url={url}
          onClick={onClick}
        />
        <span className="spotlight-minimized__expand" onClick={onExpand}>
          <IconV2 type={ICON_TYPES.EXPAND} className="spotlight-minimized__expand-icon" />
        </span>
      </div>
    </div>
  )
}

export default compose(
  connectRedux(
    null
    ,
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        deletePMSection: actions.pmSection.deletePMSection,
        setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(SpotlightMinimized)
