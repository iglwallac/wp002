import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { formatDuration, truncate, formatSeriesHost } from 'theme/web-app'
import { partial as _partial } from 'lodash'
import { List, Map } from 'immutable'
import Vote from 'components/Vote'
import Button from 'components/Button'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import Icon from 'components/Icon'
import Link from 'components/Link'
import Watch, { WATCH_RENDER_TYPE_OVERLAY_LINK } from 'components/Watch'
import TextSeasonEpisode from 'components/TextSeasonEpisode'
import ProgressBar from 'components/ProgressBar'
import { isEntitled, featureIsFree } from 'services/subscription'
import { getBoundActions } from 'actions'
import { TYPE_SHARE_V2_SHARE } from 'services/dialog'
import { CUSTOM_ROW_CLICK_EVENT, HIDDEN_CONTENT_HIDE_EVENT } from 'services/event-tracking'
import { CONTEXT_NAME_ADMIN_TITLE } from 'services/upstream-context'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WithAuth from 'components/WithAuth'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'


function renderGuest (guest, staticText) {
  if (guest) {
    return (
      <div className="shelf-episode-v2__meta-item">
        {`${staticText.get('guest')}: ${guest}`}
      </div>
    )
  }
  return null
}

function renderPreview (props) {
  const { staticText } = props
  const data = props.shelf.get('data')
  if (data.getIn(['preview', 'id']) < 0) {
    return null
  }
  return (
    <Button
      text={staticText.get('preview')}
      url={data.get('path')}
      query={{ fullplayer: 'preview' }}
      iconClass={['icon-v2 icon-v2--circular-preview']}
      buttonClass={[
        'button--ghost',
        'button--with-icon',
        'button--stacked',
        'shelf-episode-v2__action-button',
        'shelf-episode-v2__action-button--desktop-only',
      ]}
    />
  )
}

function renderPrimaryAction (props) {
  const { shelf, auth, staticText, upstreamContext, onClickWatch } = props
  const data = shelf.get('data')
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const featureOfferingIsFree = featureIsFree(
    data.getIn(['feature', 'offerings', 'availability']),
  )
  if (!userIsEntitled && !featureOfferingIsFree) {
    return (
      <ButtonSignUp
        text={staticText.get('signUpToWatch')}
        buttonClass={['button--primary', 'button--stacked']}
        type={BUTTON_SIGN_UP_TYPE_BUTTON}
        scrollToTop
      />
    )
  }
  return (
    <Watch
      url={data.get('path')}
      auth={auth}
      feature={data.get('feature')}
      preview={data.get('preview')}
      renderType={WATCH_RENDER_TYPE_OVERLAY_LINK}
      upstreamContext={upstreamContext}
      buttonClass={['button--primary', 'button--stacked']}
      onClickWatch={onClickWatch}
    >
      <div className="shelf-episode-v2__me-1232-watch">
        <span className="shelf-episode-v2__me-1232-watch-icon" />
        { staticText.get('watchNow') }
      </div>
    </Watch>
  )
}

function renderTileProgressBar (userNodeInfo, duration) {
  if (!userNodeInfo || !duration || !userNodeInfo.get('featurePosition')) {
    return null
  }
  return (
    <div className="shelf-episode-v2__progress-bar">
      <ProgressBar duration={duration} userInfo={userNodeInfo} />
    </div>
  )
}

function renderSeriesTitle (seriesTitle, seriesPath, host) {
  if (seriesTitle && seriesPath) {
    return (
      <Link className="shelf-episode-v2__series-title" to={seriesPath}>
        {formatSeriesHost(seriesTitle, host)}
      </Link>
    )
  } else if (seriesTitle) {
    return (
      <div className="shelf-episode-v2__series-title">
        {formatSeriesHost(seriesTitle, host)}
      </div>
    )
  }

  return null
}

function closeShareDialog (props) {
  const { clearShare } = props
  clearShare()
}

function getMetaItem (type, path) {
  return (
    path ?
      <Link to={path}>
        {type}
      </Link> :
      type
  )
}

function ShelfEpisode (props) {
  const {
    clearUpstreamContext,
    auth,
    getComments,
    id,
    video,
    userNodeInfo,
    upstreamContext,
    shelfEpisodeClass,
    shelf,
    isShareable,
    showHideContentButton,
    hideContent,
  } = props
  // show/hide more actions
  const [showMoreActions, setShowMoreActions] = useState(false)

  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const itemClass = Array.isArray(shelfEpisodeClass)
    ? shelfEpisodeClass.join(' ')
    : shelfEpisodeClass
  const { staticText } = props

  // Get legacy data
  const data = shelf.get('data')
  const season = data.get('season')
  const episode = data.get('episode')

  // Get data
  const feature = video.get('feature', Map())
  const featureDuration = feature.get('duration')
  const hasEpisodes = episode
  const getCommentsPartial = _partial(
    getComments,
    id,
    auth.get('jwt'),
  )

  const showMoreOptions = () => {
    setShowMoreActions(!showMoreActions)
  }

  const handleCommentClick = () => {
    getCommentsPartial()
    clearUpstreamContext()
  }

  const onClickWatch = () => {
    const { setDefaultGaEvent } = props
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Play Click')
      .set('eventLabel', upstreamContext.get(CONTEXT_NAME_ADMIN_TITLE))
      .set('contentInfo', `${video.get('title')} | video | ${video.get('id')}`)
    setDefaultGaEvent(eventData)
  }

  const onClickHide = (e) => {
    const { setDefaultGaEvent, onClickClose } = props
    const eventData = HIDDEN_CONTENT_HIDE_EVENT
      .set('eventLabel', data.get('title'))
    setDefaultGaEvent(eventData)
    onClickClose(e)
    hideContent({ contentType: 'video', contentId: id })
  }

  return (
    <div className={itemClass ? `shelf-episode-v2 ${itemClass}` : 'shelf-episode-v2'}>
      <div className="shelf-episode-v2__meta">
        <Link className="shelf-episode-v2__title" to={data.get('path')}>
          {data.get('title')}
        </Link>
        {renderSeriesTitle(
          data.get('seriesTitle'),
          data.get('seriesPath'),
          data.get('instructor'),
        )}
        <div className="shelf-episode-v2__meta-items">
          {data.get('meditationStyle') && (
            <span className="shelf-episode-v2__meta-item">
              {staticText.get('meditation')}
            </span>
          )}
          {data.get('year') && (
            <span className="shelf-episode-v2__meta-item">{data.get('year')}</span>
          )}
          {hasEpisodes ? (
            <TextSeasonEpisode
              className={['shelf-episode-v2__meta-item']}
              season={season}
              episode={episode}
            />
          ) : null}
          {data.get('guest') && renderGuest(data.get('guest'), staticText)}
          {data.get('duration') && (
            <span className="shelf-episode-v2__meta-item">
              {formatDuration(data.get('duration'))}
            </span>
          )}
          {data.get('yogaStyle') && (
            <span className="shelf-episode-v2__meta-item">
              { getMetaItem(data.get('yogaStyle'), data.get('yogaStylePath')) }
            </span>
          )}
          {data.get('yogaLevel') && (
            <span className="shelf-episode-v2__meta-item">
              { getMetaItem(data.get('yogaLevel'), data.get('yogaLevelPath')) }
            </span>
          )}
          {data.get('yogaDuration') && (
            <span className="shelf-episode-v2__meta-item">
              { getMetaItem(formatDuration(data.get('yogaDuration')), data.get('yogaDurationPath')) }
            </span>
          )}
          {data.get('fitnessStyle') && (
            <span className="shelf-episode-v2__meta-item">
              { getMetaItem(data.get('fitnessStyle'), data.get('fitnessStylePath')) }
            </span>
          )}
          {data.get('fitnessLevel') && (
            <span className="shelf-episode-v2__meta-item">
              { getMetaItem(data.get('fitnessLevel'), data.get('fitnessLevelPath')) }
            </span>
          )}
          {data.get('fitnessDuration') && (
            <span className="shelf-episode-v2__meta-item">
              { getMetaItem(formatDuration(data.get('fitnessDuration')), data.get('fitnessDurationPath')) }
            </span>
          )}
        </div>
        <div className="shelf-episode-v2__meta-items-placeholder" />
        <p className="shelf-episode-v2__description">
          {truncate(data.get('description'), 350)}
        </p>
        <div className="shelf-episode-v2__stats">
          <div className="shelf-episode-v2__stat-item">
            <Vote
              vote={data.get('vote')}
              voteDown={data.get('voteDown')}
              voteId={props.shelf.get('id')}
              auth={props.auth}
            />
          </div>
          <div
            onClick={handleCommentClick}
            className="shelf-episode-v2__stat-item shelf-episode-v2__stat-item--comment-count"
          >
            <Icon iconClass={['icon--comment', 'icon--small']} />
            <span className="shelf-episode-v2__stat-count">
              {data.get('commentTotalCount')}
            </span>
            <span className="shelf-episode-v2__stat-text">
              {staticText.get('comments')}
            </span>
          </div>
        </div>
        { renderPrimaryAction({ ...props, onClickWatch }) }
        <span className="shelf-episode-v2__actions-add-icon">
          { props.playlistAddRemoveComponent }
          <span className={`shelf-episode-v2__actions-more-icon${showMoreActions ? ' shelf-episode-v2__actions--hidden' : ''}`}>
            <Icon onClick={() => showMoreOptions()} iconClass={['icon-v2 icon-v2--ellipsis']} />
            <span className="shelf-episode-v2__actions-more-icon-text" onClick={() => showMoreOptions()}>{staticText.get('moreActions')}</span>
          </span>
        </span>
      </div>
      <div className={`shelf-episode-v2__actions-more shelf-episode-v2__actions${showMoreActions ? '' : ' shelf-episode-v2__actions--hidden'}`}>
        <div className="shelf-episode-v2__actions-top">
          <div className="shelf-episode-v2__actions-top-text">{staticText.get('moreActions')}</div>
          <span className="shelf-episode-v2__actions-top-close"><Icon onClick={() => showMoreOptions()} iconClass={['icon-v2 icon-v2--close']} /></span>
        </div>
        { props.playlistAddRemoveComponent }
        <WithAuth>
          <NotificationsFollowButton
            subscriptionType={SUBSCRIPTION_TYPES.SERIES}
            contentId={data.get('seriesId')}
            type={BUTTON_TYPES.LINK}
          />
        </WithAuth>
        <TestarossaSwitch>
          <TestarossaCase campaign="ME-3043" variation={[1]}>
            {() => (
              showHideContentButton ? <Button
                text={staticText.get('removeEpisode')}
                buttonClass={[
                  'button--ghost',
                  'button--with-icon',
                  'button--stacked',
                  'shelf-episode-v2__action-button',
                  'shelf-episode-v2__action-button--more-actions',
                ]}
                onClick={onClickHide}
                iconClass={['icon-v2 icon-v2--hide-2']}
              /> : null
            )}
          </TestarossaCase>
          <TestarossaDefault unwrap>
            {() => (
              null
            )}
          </TestarossaDefault>
        </TestarossaSwitch>
        {isShareable && userIsEntitled ?
          <WithAuth>
            <Button
              text={staticText.get('share')}
              buttonClass={[
                'button--ghost',
                'button--with-icon',
                'button--stacked',
                'shelf-episode-v2__action-button',
                'shelf-episode-v2__action-button--more-actions',
              ]}
              onClick={() => {
                props.renderModal(TYPE_SHARE_V2_SHARE, {
                  onDismiss: () => closeShareDialog(props),
                  contentId: props.id,
                  type: 'VIDEO',
                  title: data.get('title'),
                })
              }}
              iconClass={['icon-v2 icon-v2--circular-share']}
            />
          </WithAuth> : null
        }
        {renderPreview(props)}
        <Button
          text={staticText.get('fullDetails')}
          url={data.get('path')}
          buttonClass={[
            'button--ghost',
            'button--with-icon',
            'button--stacked',
            'shelf-episode-v2__action-button',
            'shelf-episode-v2__action-button--more-actions',
          ]}
          iconClass={['icon--dots']}
          scrollToTop
        />
      </div>
      { renderTileProgressBar(userNodeInfo, featureDuration) }
    </div>
  )
}

ShelfEpisode.propTypes = {
  shelfEpisodeClass: PropTypes.array,
  shelf: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  playlistAddRemoveComponent: PropTypes.element,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
  renderModal: PropTypes.func,
  clearShare: PropTypes.func,
}

export default connect(
  (state, props) => {
    const { id } = props
    const language = state.user.getIn(['data', 'language', 0], 'en')
    const videoStore = state.videos.getIn([Number(id), language], Map())
    return {
      staticText: state.staticText.getIn(['data', 'shelfEpisodeV2', 'data']),
      video: videoStore.get('data', Map()),
      userNodeInfo: state.userNodeInfo.getIn([Number(id), 'data'], Map()),
    }
  }, (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      renderModal: actions.dialog.renderModal,
      clearShare: actions.share.clearShare,
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      hideContent: actions.hiddenContentPreferences.hideContent,
    }
  },
)(ShelfEpisode)
