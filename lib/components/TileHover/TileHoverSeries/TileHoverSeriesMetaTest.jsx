import React, { useState } from 'react'
import { Map } from 'immutable'
import Link from 'components/Link'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { connect as connectRedux } from 'react-redux'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import ToolTip from 'components/ToolTip'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'

export const getSeriesHoverClass = (hovered, anyShelfOpened, hideShelf) => {
  return hovered && !anyShelfOpened && !hideShelf ? 'tile-hover-series__meta--hovered' : ''
}

const renderControls = (props) => {
  const {
    handleSeriesClick,
    series,
    onClickHide,
    staticText,
    showHideContentButton,
    isSubscribed,
    staticTextFollow,
  } = props
  const [hideHoverState, setHideHoverState] = useState(false)
  const [followHoverState, setFollowHoverState] = useState(false)

  return (
    <div className="tile-hover-series__meta-test--controls">
      <Link className="tile-hover-series__meta-test--play" to={series.get('url')} onClick={handleSeriesClick}>
        <IconV2 type={ICON_TYPES.CIRCULAR_PLAY} />
        <span className="tile-hover-series__meta-test--watch-text">Watch Now</span>
      </Link>
      <div className="tile-hover-series__meta-test--controls-container">
        {showHideContentButton && (
          <span
            className="tile-hover-series__tool-tip-container"
            onMouseEnter={() => setHideHoverState(true)}
            onMouseLeave={() => setHideHoverState(false)}
          >
            <ToolTip
              visible={hideHoverState}
              containerClassName={['tool-tip__inner--series-tile-hover']}
              className={['tool-tip__outer tool-tip__outer--series-tile-hover']}
              arrowClassName={['tool-tip__arrow--center-bottom tool-tip__arrow--center-bottom-tile-hover']}
            >
              {staticText.getIn(['data', 'removeSeries'])}
            </ToolTip>
            <IconV2 type={ICON_TYPES.HIDE_2} onClick={e => onClickHide(e, series)} />
          </span>
        )}
        <span
          className="tile-hover-series__tool-tip-container"
          onMouseEnter={() => setFollowHoverState(true)}
          onMouseLeave={() => setFollowHoverState(false)}
        >
          <ToolTip
            visible={followHoverState}
            containerClassName={['tool-tip__inner--series-tile-hover']}
            className={['tool-tip__outer tool-tip__outer--series-tile-hover-follow']}
            arrowClassName={['tool-tip__arrow--center-bottom tool-tip__arrow--center-bottom-tile-hover']}
          >
            {isSubscribed
              ? staticTextFollow.getIn(['data', 'unfollowSeries'])
              : staticTextFollow.getIn(['data', 'followingSeries'])
            }
          </ToolTip>
          <NotificationsFollowButton
            subscriptionType={SUBSCRIPTION_TYPES.SERIES}
            contentId={series.get('id')}
            type={BUTTON_TYPES.LINK}
            noLabel
          />
        </span>
      </div>
    </div>
  )
}

const Meta = (props) => {
  const {
    renderOpenShelfIcon,
    handleMouseEnter,
    handleMouseLeave,
    onClickShelf,
    series,
    hovered,
    anyShelfOpened,
    hideShelf,
    vertical,
  } = props

  const verticalClass = vertical ? 'tile-hover-series__meta--vertical' : ''
  const hoverClass = getSeriesHoverClass(hovered, anyShelfOpened, hideShelf)

  return (
    <div
      className={`tile-hover-series__meta tile-hover-series__meta-test ${verticalClass} ${hoverClass}`}
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
    >
      { renderControls(props) }
      <div onClick={e => onClickShelf(e)}>
        <div className="tile-hover-series__meta--title tile-hover-series__meta-test--title">{series.get('title')}</div>
        <div className="tile-hover-series__meta--episode tile-hover-series__meta-test--episode">{series.get('seasonCount')} Seasons, {series.get('episodeCount')} Episodes</div>
        <div className="tile-hover-series__shelf-icon tile-hover-series__meta-test--shelf-icon">
          { renderOpenShelfIcon() }
        </div>
      </div>
    </div>
  )
}

export default compose(
  connectRedux(
    (state, props) => {
      const { series } = props
      const subscription = state.notifications.getIn(
        ['subscribables', SUBSCRIPTION_TYPES.SERIES, series.get('id')], Map(),
      )
      return {
        staticTextFollow: state.staticText.getIn(['data', 'NotificationsFollowButton']),
        isSubscribed: subscription.get('subscriber'),
      }
    },
  ),
  connectStaticText({ storeKey: 'tileHoverSeries' }),
)(Meta)
