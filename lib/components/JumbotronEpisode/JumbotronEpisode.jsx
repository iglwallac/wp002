import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { formatDuration, formatSeriesHost } from 'theme/web-app'
import { List } from 'immutable'
import Button from 'components/Button'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import ButtonAdmin, {
  BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM,
} from 'components/ButtonAdmin'
import Vote, { SIZE_LARGE as VOTE_SIZE_LARGE } from 'components/Vote'
import Link from 'components/Link'
import Watch, { WATCH_RENDER_TYPE_BUTTON } from 'components/Watch'
import WatchAccess, {
  ACCESS_CHECK_AUTH_FEATURE_GEO,
} from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import NotAvailable, {
  TYPE_NOT_AVAILABLE_STANDARD,
} from 'components/NotAvailable'
import HeroImage from 'components/HeroImage'
import { H1 } from 'components/Heading'
import { getBoundActions } from 'actions'
import { TYPE_SHARE_V2_SHARE } from 'services/dialog'
import { isEntitled, isFeatureAllowedWithSubscription, hasLiveAccessEntitlement } from 'services/subscription'
import {
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
} from 'services/content-type'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import TextSeasonEpisode from 'components/TextSeasonEpisode'
import WithAuth from 'components/WithAuth'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import { isLiveAccessFeature } from 'components/LiveAccessFloatingActionToolbar'

function closeShareDialog (props) {
  const { clearShare } = props
  clearShare()
}

function renderTopMeta (type, seriesTitle, seriesPath, host) {
  switch (type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
      if (seriesTitle || host) {
        if (seriesTitle && seriesPath) {
          return (
            <Link className="jumbotron-episode__series-host" to={seriesPath}>
              {formatSeriesHost(seriesTitle, host)}
            </Link>
          )
        } else if (seriesTitle) {
          return (
            <div className="jumbotron-episode__series-host">
              {formatSeriesHost(seriesTitle, host)}
            </div>
          )
        }
      }
      return null
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      if (seriesTitle || host) {
        const hostFormatted = host ? (
          <div className="jumbotron-episode__host">{host}</div>
        ) : null
        let seriesTitleFormatted = null
        if (seriesTitle && seriesPath) {
          seriesTitleFormatted = (
            <Link className="jumbotron-episode__series-title" to={seriesPath}>
              {seriesTitle}
            </Link>
          )
        } else if (seriesTitle) {
          seriesTitleFormatted = (
            <div className="jumbotron-episode__series-title">{seriesTitle}</div>
          )
        }
        return (
          <div className="jumbotron-episode__series-host">
            {hostFormatted}
            {seriesTitleFormatted}
          </div>
        )
      }
      return null
    default:
      return null
  }
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

function renderBottomMeta (props) {
  const {
    yogaLevelPath,
    yogaStylePath,
    yogaDurationPath,
    fitnessLevelPath,
    fitnessStylePath,
    fitnessDurationPath,
  } = props

  const metaItemClassName = 'jumbotron-episode__meta-item'
  const meditationStyleFormatted = props.meditationStyle ? (
    <span className={metaItemClassName}>{props.meditationStyle}</span>
  ) : null
  const durationFormatted = props.duration ? (
    <span className={metaItemClassName}>
      {
        fitnessDurationPath || yogaDurationPath ?
          <Link to={fitnessDurationPath || yogaDurationPath}>
            {formatDuration(props.duration)}
          </Link> : formatDuration(props.duration)
      }
    </span>
  ) : null
  const yearFormatted = props.year ? (
    <span className={metaItemClassName}>{props.year}</span>
  ) : null
  const yogaStyleFormatted = props.yogaStyle ? (
    <span className={metaItemClassName}>
      {getMetaItem(props.yogaStyle, yogaStylePath)}
    </span>
  ) : null
  const yogaLevelFormatted = props.yogaLevel ? (
    <span className={metaItemClassName}>
      {getMetaItem(props.yogaLevel, yogaLevelPath)}
    </span>
  ) : null
  const fitnessStyleFormatted = props.fitnessStyle ? (
    <span className={metaItemClassName}>
      {getMetaItem(props.fitnessStyle, fitnessStylePath)}
    </span>
  ) : null
  const fitnessLevelFormatted = props.fitnessLevel ? (
    <span className={metaItemClassName}>
      {getMetaItem(props.fitnessLevel, fitnessLevelPath)}
    </span>
  ) : null

  switch (props.type) {
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_SEGMENT:
      return (
        <div className="jumbotron-episode__meta-items">
          <TextSeasonEpisode
            className={['jumbotron-episode__meta-item']}
            season={props.season}
            episode={props.episode}
            lang={props.page.get('lang')}
          />
          {durationFormatted}
          {yearFormatted}
        </div>
      )
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return (
        <div className="jumbotron-episode__meta-items">
          <TextSeasonEpisode
            className={['jumbotron-episode__meta-item']}
            season={props.season}
            episode={props.episode}
            lang={props.page.get('lang')}
          />
          {yogaStyleFormatted}
          {yogaLevelFormatted}
          {fitnessStyleFormatted}
          {fitnessLevelFormatted}
          {meditationStyleFormatted}
          {durationFormatted}
        </div>
      )
    default:
      return null
  }
}

function renderWatch (props) {
  const {
    auth,
    path,
    feature,
    preview,
    staticText,
    upstreamContext,
  } = props
  const userHasAnEntitlement = isEntitled(auth.get('subscriptions', List()))
  const featureIsAllowed = isFeatureAllowedWithSubscription(feature, auth)
  const signupText = isLiveAccessFeature(feature) ? staticText.get('signUpLiveAccessToWatch') : staticText.get('signUpToWatch')
  if (!userHasAnEntitlement && !featureIsAllowed) {
    return (
      <ButtonSignUp
        text={signupText}
        buttonClass={['button--primary', 'button--stacked']}
        type={BUTTON_SIGN_UP_TYPE_BUTTON}
        scrollToTop
      />
    )
  } else if (userHasAnEntitlement && !featureIsAllowed) {
    return (
      <Button
        url={'/account'}
        text={staticText.get('upgradeToWatch')}
        buttonClass={['button--primary', 'button--stacked']}
      />
    )
  }
  return (
    <Watch
      url={path}
      auth={auth}
      feature={feature}
      preview={preview}
      renderType={WATCH_RENDER_TYPE_BUTTON}
      upstreamContext={upstreamContext}
      buttonClass={['button--with-icon jumbotron-episode__action-button']}
      iconClass={['icon-v2 icon-v2--circular-play episode-button']}
    />
  )
}

function renderPreview (props) {
  const { preview, path, staticText } = props
  if (preview.get('id') < 0) {
    return null
  }
  return (
    <Button
      text={staticText.get('preview')}
      url={path}
      query={{ fullplayer: 'preview' }}
      iconClass={['icon-v2 icon-v2--circular-preview episode-button']}
      buttonClass={[
        'button--ghost',
        'button--with-icon',
        'button--stacked',
        'jumbotron-episode__action-button',
      ]}
    />
  )
}

function renderFullSeries (props) {
  const { seriesPath, staticText } = props
  if (!seriesPath) {
    return null
  }
  return (
    <Button
      text={staticText.get('fullSeries')}
      buttonClass={[
        'button--ghost',
        'button--with-icon',
        'button--stacked',
        'jumbotron-episode__action-button',
      ]}
      url={seriesPath}
      iconClass={['icon-v2 icon-v2--circular-series episode-button']}
    />
  )
}

function JumbotronEpisode (props) {
  const {
    auth,
    title,
    type,
    seriesTitle,
    seriesPath,
    host,
    vote,
    voteDown,
    voteId,
    isShareable,
    feature,
    preview,
    heroImage,
    staticText,
    id,
    seriesId,
    upstreamContext,
    contentPolicyPolicyId,
  } = props
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const showLiveAccessFat = isLiveAccessFeature(feature, contentPolicyPolicyId) && !hasLiveAccessEntitlement(auth.get('subscriptions', List()))
  return (
    <div className={`jumbotron-episode ${showLiveAccessFat ? 'jumbotron-episode__show-live-access-fat' : ''}`} >
      <div className="jumbotron-episode__wrapper">
        <HeroImage
          className={['jumbotron-episode__background-hero']}
          hasOverlay
          smallUrl={heroImage.get('small')}
          mediumSmallUrl={heroImage.get('mediumSmall')}
          mediumUrl={heroImage.get('medium')}
          largeUrl={heroImage.get('large')}
        />
        <div className="jumbotron-episode__content">
          <div className="jumbotron-episode__meta">
            <H1 inverted className="jumbotron-episode__title">{title}</H1>
            {renderTopMeta(type, seriesTitle, seriesPath, host)}
            {renderBottomMeta(props)}
            <Vote
              size={VOTE_SIZE_LARGE}
              vote={vote}
              voteDown={voteDown}
              text={staticText.get('recommend')}
              className="vote--jumbotron-meta"
              voteId={voteId}
              auth={auth}
            />
            <div className="jumbotron-episode__actions jumbotron-episode__actions-b">
              <WatchAccess
                auth={auth}
                preview={preview}
                feature={feature}
                accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
              >
                <WatchAccessDenied>
                  <NotAvailable
                    type={TYPE_NOT_AVAILABLE_STANDARD}
                    message={staticText.get('notAvailableInRegion')}
                  />
                </WatchAccessDenied>
                <WatchAccessAllowed>
                  {feature.get('id', -1) !== -1 ? renderWatch(props) : null}
                  {auth.get('jwt') && <PlaylistAddRemove
                    upstreamContext={upstreamContext}
                    contentId={id}
                    circlularIcon
                  />}
                </WatchAccessAllowed>
              </WatchAccess>
            </div>
          </div>
          <div className="jumbotron-episode__actions jumbotron-episode__actions-b--mobile">
            <WatchAccess
              auth={auth}
              preview={preview}
              feature={feature}
              accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
            >
              <WatchAccessDenied>
                <NotAvailable
                  type={TYPE_NOT_AVAILABLE_STANDARD}
                  message={staticText.get('notAvailableInRegion')}
                />
              </WatchAccessDenied>
              <WatchAccessAllowed>
                {feature.get('id', -1) !== -1 ? renderWatch(props) : null}
                {auth.get('jwt') && <PlaylistAddRemove
                  upstreamContext={upstreamContext}
                  contentId={id}
                  circlularIcon
                />}
              </WatchAccessAllowed>
            </WatchAccess>
          </div>
          <div className="jumbotron-episode__actions">
            <WatchAccess
              auth={auth}
              preview={preview}
              feature={feature}
              accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
            >
              <WatchAccessAllowed>
                <WithAuth>
                  <NotificationsFollowButton
                    subscriptionType={SUBSCRIPTION_TYPES.SERIES}
                    type={BUTTON_TYPES.LINK}
                    contentId={seriesId}
                  />
                </WithAuth>
                {isShareable && userIsEntitled ?
                  <WithAuth>
                    <Button
                      text={staticText.get('share')}
                      buttonClass={[
                        'button--ghost',
                        'button--with-icon',
                        'button--stacked',
                        'jumbotron-episode__action-button',
                      ]}
                      onClick={() => {
                        props.renderModal(TYPE_SHARE_V2_SHARE, {
                          onDismiss: () => closeShareDialog(props),
                          contentId: props.id,
                          type: 'VIDEO',
                          title,
                        })
                      }}
                      iconClass={['icon-v2 icon-v2--circular-share episode-button']}
                    />
                  </WithAuth> : null
                }
                {renderPreview(props)}
                {renderFullSeries(props)}
              </WatchAccessAllowed>
            </WatchAccess>
          </div>
        </div>
        <ButtonAdmin
          id={id}
          auth={auth}
          align={BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM}
          type={type}
        />
      </div>
    </div>
  )
}

JumbotronEpisode.propTypes = {
  id: PropTypes.number,
  type: PropTypes.string.isRequired,
  heroImage: ImmutablePropTypes.map.isRequired,
  title: PropTypes.string.isRequired,
  seriesId: PropTypes.number,
  seriesTitle: PropTypes.string.isRequired,
  episode: PropTypes.number.isRequired,
  season: PropTypes.number,
  guest: PropTypes.string,
  host: PropTypes.string,
  duration: PropTypes.number.isRequired,
  yogaLevel: PropTypes.string,
  yogaStyle: PropTypes.string,
  yogaLevelPath: PropTypes.string,
  yogaStylePath: PropTypes.string,
  yogaDurationPath: PropTypes.string,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
  fitnessLevelPath: PropTypes.string,
  fitnessStylePath: PropTypes.string,
  fitnessDurationPath: PropTypes.string,
  meditationStyle: PropTypes.string,
  year: PropTypes.string,
  vote: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  voteId: PropTypes.number.isRequired,
  seriesPath: PropTypes.string,
  isShareable: PropTypes.bool,
  preview: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  path: PropTypes.string.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
}

JumbotronEpisode.defaultProps = {
  openShareDialog: () => { },
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'jumbotronEpisode', 'data']),
  isShareable: state.jumbotron.getIn(['detail', 'data', 'feature', 'shareAllowed'], false),
  contentPolicyPolicyId: state.detail.getIn(['data', 'contentPolicyPolicyId']),
}),
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    renderModal: actions.dialog.renderModal,
    clearShare: actions.share.clearShare,
  }
})(JumbotronEpisode)
