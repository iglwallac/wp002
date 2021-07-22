import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage } from 'components/Page/connect'
import { List, Map } from 'immutable'
import _get from 'lodash/get'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { TYPE_FEATURE, CONSUMER_TYPE_WEBAPP } from 'services/video'
import DownloadAppModal from 'components/DownloadAppModal'
import VideoPlayer from 'components/VideoPlayer'
import { getBoundActions } from 'actions'
import { STORE_KEY_DETAIL } from 'services/store-keys'
import Link from 'components/Link'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { setContentImpression } from 'services/content-impressions'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_LINK } from 'components/ButtonSignUp'
import VideoEmailGate from 'components/VideoEmailGate'
import { isIOS, isNonAmazonAndroid, isAmazon } from 'environment'
import { get as getConfig } from 'config'

const config = getConfig()

const BROWSER = process.env.BROWSER

function getLocationPlayerType (location) {
  if (location.query && location.query.fullplayer) {
    return location.query.fullplayer
  }
  return null
}

function getLocationPlayerConsumer (location) {
  if (location.query && location.query.consumer) {
    switch (location.query.consumer) {
      case CONSUMER_TYPE_WEBAPP:
        return 'webapp'
      default:
        return ''
    }
  }
  return ''
}

function videoIsSynced (video, resolver) {
  const resolvedId = resolver.getIn(['data', 'id'])
  return (
    resolvedId === video.get('id') && resolvedId === video.getIn(['data', 'id'])
  )
}

function mediaIsSynced (playerId, media) {
  return (
    playerId === media.get('id') && playerId === media.getIn(['data', 'id'])
  )
}

function userVideoIsSynced (videoId, userVideo) {
  return (
    videoId === userVideo.get('id') &&
    videoId === userVideo.getIn(['data', 'id'])
  )
}

function updateVideo (props) {
  const { video, user, getVideoData, resolver, location } = props
  // We are only interested when if entity data has been updated
  const resolvedId = resolver.getIn(['data', 'id'])
  if (!video.get('data') || location.pathname !== video.get('path')) {
    // We need the next state of the resolver which has the most up to date data.
    const resolverSynced = resolverIsSynced(resolver, location)
    const videoSynced = videoIsSynced(video, resolver)
    if (
      resolvedId &&
      resolvedId > -1 &&
      resolverSynced &&
      !videoSynced &&
      !video.get('processing')
    ) {
      getVideoData({
        id: resolvedId,
        path: location.pathname,
        language: user.getIn(['data', 'language'], List()),
      })
    }
  }
}

function updateMedia (props) {
  const { media, getMediaData, video, location, auth, user, resolver } = props
  const playerType = getLocationPlayerType(location)
  const videoId = video.getIn(['data', playerType, 'id'])
  const resolverSynced = resolverIsSynced(resolver, location)
  const mediaSynced = mediaIsSynced(videoId, media)
  const videoSynced = videoIsSynced(video, resolver)
  const mediaPathSynced = location.pathname === media.get('path')
  // Check if we even can fetch media
  if (
    videoId < 0 ||
    !resolverSynced ||
    !videoSynced ||
    media.get('processing')
  ) {
    return
  }
  // We can fetch media so see if we need to
  if (!media.get('data') || !mediaPathSynced || !mediaSynced) {
    getMediaData({ id: videoId, path: location.pathname, auth, user })
  }
}

function updateUserVideo (props) {
  const { userVideo, getUserVideoData, video, location, auth, resolver } = props
  const playerType = getLocationPlayerType(location)
  const videoId = video.getIn(['data', 'id'])
  // We are only interested in logged in users if we have a video id available for featured videos
  if (!auth.get('jwt') || !videoId || playerType !== TYPE_FEATURE) {
    return
  }
  if (
    !userVideo.get('data') ||
    location.pathname !== userVideo.get('path') ||
    userVideo.getIn(['data', 'id']) !== videoId
  ) {
    const resolverSynced = resolverIsSynced(resolver, location)
    const videoSynced = videoIsSynced(video, resolver)
    const userVideoSynced = userVideoIsSynced(videoId, userVideo)
    if (
      resolverSynced &&
      videoSynced &&
      videoId &&
      !userVideoSynced &&
      !userVideo.get('processing')
    ) {
      getUserVideoData(videoId, location.pathname, auth.get('jwt'))
    }
  }
}

function shouldCheckUserVideo (props) {
  const { location, auth } = props
  const playerType = getLocationPlayerType(location)
  return playerType === TYPE_FEATURE && auth.get('jwt')
}

function shouldRenderContent (auth) {
  const isMember = auth.get('jwt', null)
  return isMember === null || isMember
}

function shouldRenderDownloadAppModal (auth, state) {
  const isMember = auth.get('jwt', null)
  const { skipDownloadAppModal } = state
  if (skipDownloadAppModal) {
    return false
  }
  if (isMember == null) {
    return false
  }
  return isIOS() || isNonAmazonAndroid() || isAmazon()
}

function renderAccessErrors (props) {
  const { video, auth, media, staticText } = props
  if (!media.getIn(['data', 'bcHLS'], null)) {
    return renderVideoNotAvailableError(staticText)
  } else if (auth.get('jwt') && auth.get('subscriptions', List()).size === 0) {
    return (
      <div className="video__not-found">
        {`${staticText.getIn([
          'data',
          'noLongerHaveAnActiveSubscription',
        ])} ${staticText.getIn(['data', 'reactivateYourSubscription'])} `}
        <ButtonSignUp type={BUTTON_SIGN_UP_TYPE_LINK} scrollToTop>{`${staticText.getIn([
          'data',
          'here',
        ])}`}</ButtonSignUp>.
      </div>
    )
  } else if (!auth.get('jwt')) {
    return (
      <div className="video__not-found">
        {staticText.getIn(['data', 'doNotHaveAnActiveSubscription'])}
        {staticText.getIn(['data', 'youCanCreateYourSubscription'])}{' '}
        <ButtonSignUp type={BUTTON_SIGN_UP_TYPE_LINK} scrollToTop>{staticText.getIn(['data', 'here'])}</ButtonSignUp>.
      </div>
    )
  }
  return (
    <div className="video__not-found">
      {`${staticText.getIn([
        'data',
        'notAvailableInYourRegion',
      ])} ${staticText.getIn(['data', 'go'])} `}
      <Link to={video.getIn(['data', 'path'])}>
        {staticText.getIn(['data', 'here'])}
      </Link>
      {staticText.getIn(['data', 'toReturnToTheVideoDetailPage'])}
    </div>
  )
}

function renderVideoNotAvailableError (staticText) {
  return (
    <div className="video__not-found">
      {staticText.getIn(['data', 'sorryTheVideoYouRequestedIsNotAvailable'])}
    </div>
  )
}

function renderVideoPlayer (props, store) {
  const {
    media,
    userVideo,
    resolver,
    location,
    video,
    history,
    staticText,
    emailSignup,
  } = props
  const videoSynced = videoIsSynced(video, resolver)
  const resolverSynced = resolverIsSynced(resolver, location)
  const showGatedEmailSignup = emailSignup.get('previewGateVisible', false)
  const gatedPreviews = _get(config, ['features', 'player', 'gatedPreviews'])

  if (gatedPreviews && videoSynced && resolverSynced && showGatedEmailSignup) {
    return (
      <VideoEmailGate history={history} />
    )
  }

  const resolvedId = resolver.getIn(['data', 'id'])
  const playerType = getLocationPlayerType(location)
  const playerId = video.getIn(['data', playerType, 'id'])
  const videoId = video.getIn(['data', 'id'])
  const mediaSynced = mediaIsSynced(playerId, media)
  const userVideoSynced = userVideoIsSynced(videoId, userVideo)
  const checkUserVideo = shouldCheckUserVideo(props)
  const pathNotFound = resolverSynced && resolvedId === -1
  const mediaNotFound =
    videoSynced && mediaSynced && !media.getIn(['data', 'id'])

  if (playerId === -1 || pathNotFound || mediaNotFound) {
    return renderVideoNotAvailableError(staticText)
  } else if (videoSynced && mediaSynced &&
    (!checkUserVideo || userVideoSynced) && !media.getIn(['data', 'bcHLS'], null)) {
    return renderAccessErrors(props)
  } else if (!videoSynced || !mediaSynced
    || (checkUserVideo && !userVideoSynced)) {
    return null
  }

  return (
    <VideoPlayer
      store={store}
      location={location}
      history={history}
      type={getLocationPlayerType(location)}
    />
  )
}

class VideoPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      skipDownloadAppModal: false,
      shouldRedirect: true,
    }
  }

  componentDidMount () {
    const { props } = this
    const { emailSignup, setEmailSignupPreviewGateVisible, auth } = props
    const emailSignupPreviewCount = emailSignup.get('previewCount', 0)
    const emailSignupCompleted = emailSignup.get('completed', false)
    const gatedPreviews = _get(config, ['features', 'player', 'gatedPreviews'])
    const authToken = auth.get('jwt')

    updateVideo(props)
    updateMedia(props)
    updateUserVideo(props)

    // show the preview gate
    if (gatedPreviews && !authToken && !emailSignupCompleted && emailSignupPreviewCount >= 3) {
      setEmailSignupPreviewGateVisible(true)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!BROWSER) {
      return
    }

    const { emailSignup, setEmailSignupPreviewGateVisible, auth } = nextProps
    const nextEmailSignupPreviewCount = emailSignup.get('previewCount', 0)
    const nextEmailSignupCompleted = emailSignup.get('completed', false)
    const nextEmailSignupPreviewGateVisible = emailSignup.get('previewGateVisible')
    const previousEmailSignupCompleted = this.props.emailSignup.get('completed', false)
    const previousEmailSignupPreviewCount = this.props.emailSignup.get('previewCount', 0)
    const gatedPreviews = _get(config, ['features', 'player', 'gatedPreviews'])
    const authToken = auth.get('jwt')

    updateVideo(nextProps)
    updateMedia(nextProps)
    updateUserVideo(nextProps)

    // show the preview gate
    if (
      gatedPreviews &&
      !authToken &&
      (!nextEmailSignupCompleted || nextEmailSignupCompleted !== previousEmailSignupCompleted) &&
      !nextEmailSignupPreviewGateVisible &&
      nextEmailSignupPreviewCount >= 3 &&
      previousEmailSignupPreviewCount !== 2 &&
      nextEmailSignupPreviewCount !== previousEmailSignupPreviewCount
    ) {
      setEmailSignupPreviewGateVisible(true)
    }
  }

  componentWillUnmount () {
    const {
      props,
    } = this
    const {
      resetMedia,
      resetUserVideo,
    } = props
    resetMedia()
    resetUserVideo()
  }

  handleDownloadClick = () => {
    const { auth, video } = this.props
    const videoId = video.get('id', null)
    if (videoId) {
      // Set the video as the user's content impression so it's
      // the first thing they see once they login to the mobile app.
      setContentImpression({
        auth,
        timestamp: new Date(),
        contentId: videoId,
        contentType: 'video',
      })
    }
  }

  handleSkipClick = () => {
    // Persist their choice to skip the app download in state so
    // they're repeatedly prompted.
    this.setState({
      skipDownloadAppModal: true,
    })
  }

  render () {
    const { state, props, context } = this
    const { store } = context
    const { location, video, auth = Map() } = props
    if (shouldRenderContent(auth)) {
      // On supported mobile platforms, the user should be presented with
      // an interstitial page linking to the Gaia app in the platform's respective
      // app store.
      if (shouldRenderDownloadAppModal(auth, state)) {
        const videoId = video.get('id', null)
        if (videoId) {
          return (
            <DownloadAppModal
              video={video}
              onDownloadAppClick={this.handleDownloadClick}
              onSkipDownloadClick={this.handleSkipClick}
            />
          )
        }
      }

      // default video page experience
      const consumer = getLocationPlayerConsumer(location)
      const consumerClass = consumer ? ` video-consumer__${consumer}` : ''
      return (
        <article className={`video${consumerClass}`}>
          {renderVideoPlayer(props, store)}
        </article>
      )
    }
    return null
  }
}

VideoPage.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  media: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  getVideoData: PropTypes.func.isRequired,
  getMediaData: PropTypes.func.isRequired,
  resetMedia: PropTypes.func.isRequired,
  getUserVideoData: PropTypes.func.isRequired,
  resetUserVideo: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  emailSignup: ImmutablePropTypes.map.isRequired,
  setEmailSignupPreviewGateVisible: PropTypes.func.isRequired,
}

VideoPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
      video: state.video,
      resolver: state.resolver,
      media: state.media,
      userVideo: state.userVideo,
      comments: state.comments,
      page: state.page,
      staticText: state.staticText.getIn(['data', 'videoPage']),
      emailSignup: state.emailSignup,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getVideoData: actions.video.getVideoData,
        getMediaData: actions.media.getMediaData,
        resetMedia: actions.media.resetMedia,
        getUserVideoData: actions.userVideo.getUserVideoData,
        resetUserVideo: actions.userVideo.resetUserVideo,
        setEmailSignupPreviewGateVisible: actions.emailSignup.setEmailSignupPreviewGateVisible,
      }
    },
  ),
  connectPage({
    storeKey: STORE_KEY_DETAIL,
    storeBranch: 'jumbotron',
  }),
)(VideoPage)
