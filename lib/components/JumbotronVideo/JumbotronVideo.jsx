import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { formatDuration } from 'theme/web-app'
import { List } from 'immutable'
import Button from 'components/Button'
import Link from 'components/Link'
import { H1 } from 'components/Heading'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import ButtonAdmin, {
  BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM,
} from 'components/ButtonAdmin'
import Vote, { SIZE_LARGE as VOTE_SIZE_LARGE } from 'components/Vote'
import Watch, { WATCH_RENDER_TYPE_BUTTON } from 'components/Watch'
import WatchAccess, {
  ACCESS_CHECK_AUTH_FEATURE_GEO,
} from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import NotAvailable, {
  TYPE_NOT_AVAILABLE_STANDARD,
} from 'components/NotAvailable'
import { isEntitled, isFeatureAllowedWithSubscription } from 'services/subscription'
import { getBoundActions } from 'actions'
import { TYPE_SHARE_V2_SHARE } from 'services/dialog'
import HeroImage, {
  HERO_IMAGE_OVERLAY_OPACITY_MEDIUM,
} from 'components/HeroImage'
import {
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
} from 'services/content-type'
import WithAuth from 'components/WithAuth'
import PlaylistAddRemove from 'components/PlaylistAddRemove'

function closeShareDialog (props) {
  const { clearShare } = props
  clearShare()
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
  const signupText = staticText.get('signUpToWatch')
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
      buttonClass={['button--with-icon jumbotron-video__action-button']}
      iconClass={['icon-v2 icon-v2--circular-play video-button']}
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
      iconClass={['icon-v2 icon-v2--circular-preview video-button']}
      buttonClass={[
        'button--ghost',
        'button--with-icon',
        'button--stacked',
        'jumbotron-video__action-button',
      ]}
    />
  )
}

function renderTopMeta (props) {
  const {
    yogaTeacherPath,
    fitnessInstructorPath,
  } = props
  switch (props.type) {
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
      if (props.host) {
        return (
          <div className="jumbotron-video__host">
            {
              yogaTeacherPath || fitnessInstructorPath ?
                <Link to={yogaTeacherPath || fitnessInstructorPath}>
                  {props.host}
                </Link> : props.host
            }
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
  const metaItemClassName = 'jumbotron-video__meta-item'
  const meditationStyleFormatted =
    props.meditationStyle && props.yogaStyle !== 'Meditation' ? (
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
  const yearFormatted = props.year ? (
    <span className={metaItemClassName}>{props.year}</span>
  ) : null
  switch (props.type) {
    case TYPE_CONTENT_VIDEO:
      return (
        <div className="jumbotron-video__meta-items">
          {durationFormatted}
          {yearFormatted}
        </div>
      )
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
      return (
        <div className="jumbotron-video__meta-items">
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

function JumbotronVideo (props) {
  const {
    auth,
    feature,
    isShareable,
    preview,
    staticText,
    id,
    type,
    upstreamContext,
  } = props
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  return (
    <div className="jumbotron-video">
      <div className="jumbotron-video__wrapper">
        <HeroImage
          className={['jumbotron-video__background-hero']}
          hasOverlay
          overlayOpacity={HERO_IMAGE_OVERLAY_OPACITY_MEDIUM}
          smallUrl={props.heroImage.get('small')}
          mediumSmallUrl={props.heroImage.get('mediumSmall')}
          mediumUrl={props.heroImage.get('medium')}
          largeUrl={props.heroImage.get('large')}
        />
        <div className="jumbotron-video__content">
          <div className="jumbotron-video__meta">
            <H1 inverted className="jumbotron-video__title">{props.title}</H1>
            {renderTopMeta(props)}
            {renderBottomMeta(props)}
            <Vote
              vote={props.vote}
              voteDown={props.voteDown}
              text={staticText.get('recommend')}
              className="vote--jumbotron-meta"
              size={VOTE_SIZE_LARGE}
              voteId={props.voteId}
              auth={props.auth}
            />
            <div className="jumbotron-video__actions jumbotron-video__actions-b">
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
                  {renderWatch(props)}
                  {auth.get('jwt') && <PlaylistAddRemove
                    upstreamContext={upstreamContext}
                    contentId={id}
                    circlularIcon
                  />}
                </WatchAccessAllowed>
              </WatchAccess>
            </div>
          </div>
          <div className="jumbotron-video__actions jumbotron-video__actions-b--mobile">
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
                {renderWatch(props)}
                {auth.get('jwt') && <PlaylistAddRemove
                  upstreamContext={upstreamContext}
                  contentId={id}
                  circlularIcon
                />}
              </WatchAccessAllowed>
            </WatchAccess>
          </div>
          <div className="jumbotron-video__actions">
            <WatchAccess
              auth={auth}
              preview={preview}
              feature={feature}
              accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
            >
              <WatchAccessAllowed>
                {isShareable && userIsEntitled ?
                  <WithAuth>
                    <Button
                      text={staticText.get('share')}
                      buttonClass={[
                        'button--ghost',
                        'button--with-icon',
                        'button--stacked',
                        'jumbotron-video__action-button',
                      ]}
                      onClick={() => {
                        props.renderModal(TYPE_SHARE_V2_SHARE, {
                          onDismiss: () => closeShareDialog(props),
                          contentId: props.id,
                          type: 'VIDEO',
                          title: props.title,
                        })
                      }}
                      iconClass={['icon-v2 icon-v2--circular-share video-button']}
                    />
                  </WithAuth> : null
                }
                {renderPreview(props)}
              </WatchAccessAllowed>
            </WatchAccess>
          </div>
        </div>
        <ButtonAdmin
          id={props.id}
          auth={props.auth}
          align={BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM}
          type={type}
        />
      </div>
    </div>
  )
}

JumbotronVideo.propTypes = {
  type: PropTypes.string.isRequired,
  heroImage: ImmutablePropTypes.map.isRequired,
  title: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  yogaLevel: PropTypes.string,
  yogaStyle: PropTypes.string,
  yogaLevelPath: PropTypes.string,
  yogaStylePath: PropTypes.string,
  yogaDurationPath: PropTypes.string,
  yogaTeacherPath: PropTypes.string,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
  fitnessLevelPath: PropTypes.string,
  fitnessStylePath: PropTypes.string,
  fitnessDurationPath: PropTypes.string,
  fitnessInstructorPath: PropTypes.string,
  meditationStyle: PropTypes.string,
  seriesId: PropTypes.number,
  host: PropTypes.string,
  year: PropTypes.string,
  isShareable: PropTypes.bool,
  vote: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  voteId: PropTypes.number.isRequired,
  preview: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  path: PropTypes.string.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'jumbotronVideo', 'data']),
  isShareable: state.jumbotron.getIn(['detail', 'data', 'feature', 'shareAllowed'], false),
}),
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    renderModal: actions.dialog.renderModal,
    clearShare: actions.share.clearShare,
  }
})(JumbotronVideo)
