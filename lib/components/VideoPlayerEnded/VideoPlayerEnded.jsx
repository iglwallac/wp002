import PropTypes from 'prop-types'
import React, { useEffect, useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import VideoPlayerUpNext from 'components/VideoPlayerUpNext'
import VideoPlayerBack from 'components/VideoPlayerBack'
import VideoCommentsToggle from 'components/VideoCommentsToggle'
import Vote, { SIZE_LARGE as VOTE_SIZE_LARGE } from 'components/Vote'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { TYPE_PREVIEW } from 'services/video'
import { TYPE_LOGIN, TYPE_SHARE_V2_SHARE } from 'services/dialog'
import Button from 'components/Button'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import GaiaLogo, { TYPE_TEAL as GAIA_LOGO_TYPE_TEAL } from 'components/GaiaLogo'
import VideoPlayerMeta from 'components/VideoPlayerMeta'
import VideoPlayerEndedPreviewEntitled from 'components/VideoPlayerEndedPreviewEntitled'
import { URL_HOME } from 'services/url/constants'
import { getEmailCustomerServiceUrl } from 'services/url'
import { getPrimary } from 'services/languages'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import { USER_ACCOUNT_PAUSED } from 'services/user-account'
import { CONTEXT_TYPE_VIDEO_END_STATE } from 'services/upstream-context'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WithAuth from 'components/WithAuth'
import { isEntitled } from 'services/subscription'

//
// cached class names
// we're doing this because of old react components
// built ages ago that use arrays as class names.
// arrays cause re-rendering when supplied in render()
// since these classnames never change, we're hoisting them
// to the top of this file and referencing the classes throughout
const CLASS_NAMES = {
  SHARE: ['button--ghost', 'button--with-icon', 'button--stacked', 'jumbotron-episode__action-button'],
  SIGNUP: ['button--primary video-player-ended__sign-up-button'],
  LOGIN: ['button--ghost video-player-ended__login-button'],
  VIDEO_PLAYER_BACK: ['video-player-ended__back'],
  META: ['video-player-ended__video-player-meta'],
  LOGO: ['video-player-ended__gaia-logo'],
  ICON_SHARE: ['icon--share'],
}

function renderFeatureEndState (props, onShare) {
  const { staticText, isShareable, video, auth } = props
  const videoTitle = video.getIn(['data', 'title'])
  const seriesId = video.getIn(['data', 'seriesId'])
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  return (
    <div className="video-player-ended__meta">
      <div className="video-player-ended__you-finished">
        {staticText.getIn(['data', 'youJustFinished'])}
      </div>
      <div className="video-player-ended__title">{videoTitle}</div>
      <div className="video-player-ended__vote-text">
        {staticText.getIn(['data', 'wouldYouRecommendThisVideo'])}
      </div>
      <Vote
        voteDown={video.getIn(['data', 'voteDown'], 0)}
        vote={video.getIn(['data', 'vote'])}
        voteId={video.getIn(['data', 'id'])}
        className="video-player-ended__vote"
        size={VOTE_SIZE_LARGE}
        auth={auth}
      />
      <WithAuth>
        {seriesId ? (
          <NotificationsFollowButton
            subscriptionType={SUBSCRIPTION_TYPES.SERIES}
            type={BUTTON_TYPES.LINK}
            contentId={seriesId}
          />
        ) : null}
      </WithAuth>
      {isShareable && userIsEntitled ?
        <WithAuth>
          <Button
            text={staticText.getIn(['data', 'share'])}
            iconClass={CLASS_NAMES.ICON_SHARE}
            buttonClass={CLASS_NAMES.SHARE}
            onClick={onShare}
          />
        </WithAuth> : null
      }
    </div>
  )
}

function renderPreviewEndState (props, onLogin) {
  const { userAccount, staticText, user, auth } = props

  const authToken = auth.get('jwt')
  const subscriptions = auth.get('subscriptions', List())
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const holdMessage = staticText.getIn(['data', 'membershipIsPaused'])
  const accountStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const unentitledMessage = authToken ? staticText.getIn(['data', 'becomeAMemberOrLoginToContinueWatching'])
    : staticText.getIn(['data', 'becomeAMemberToContinueWatching'])

  // paused account end state
  if (authToken && accountStatus === USER_ACCOUNT_PAUSED) {
    return (
      <div className="video-player-ended__preview">
        <GaiaLogo className={CLASS_NAMES.LOGO} type={GAIA_LOGO_TYPE_TEAL} />
        <span className="video-player-ended__account-paused">{holdMessage}</span>
        <Button
          url={getEmailCustomerServiceUrl(userLanguage)}
          text={staticText.getIn(['data', 'contact'])}
          buttonClass={CLASS_NAMES.SIGNUP}
          target={TARGET_BLANK}
        />
        <Link
          to={URL_HOME}
          className="video-player-ended__home-link"
        >{staticText.getIn(['data', 'gaiaHomeLink'])}
        </Link>
      </div>
    )
  }
  // unentitled end state
  if (!subscriptions.size) {
    return (
      <div className="video-player-ended__preview">
        <GaiaLogo className={CLASS_NAMES.LOGO} type={GAIA_LOGO_TYPE_TEAL} />
        <span className="video-player-ended__sign-up-copy">{unentitledMessage}</span>
        <ButtonSignUp
          text={staticText.getIn(['data', 'signUp'])}
          type={BUTTON_SIGN_UP_TYPE_BUTTON}
          buttonClass={CLASS_NAMES.SIGNUP}
          scrollToTop
        />
        {!authToken ? (
          <Button
            text={staticText.getIn(['data', 'logIn'])}
            buttonClass={CLASS_NAMES.LOGIN}
            onClick={onLogin}
          />
        ) : null}
      </div>
    )
  }
  // default end state
  return (
    <VideoPlayerEndedPreviewEntitled
      location={props.location}
      video={props.video}
      language={getPrimary(user.getIn(['data', 'language']))}
    />
  )
}

function VideoPlayerEnded (props) {
  const { refreshComments, location, comments, history, video, auth, type } = props
  const enableTimer = video.getIn(['endState', 'timerVisible'], null) !== false
  const previousVideoType = video.getIn(['data', 'type', 'content'])
  const subscriptions = auth.get('subscriptions', List())
  const videoId = video.getIn(['data', 'id'], null)

  //
  // componentWillUnmount hook
  // remove the endstate timer from redux
  useEffect(() => () => {
    const { setVideoEndStateTimerVisible } = props
    setVideoEndStateTimerVisible(null)
  })

  //
  // onCommentsWillShow event listener
  // stops the endstate timer from incrementing
  const onCommentsWillShow = useCallback(() => {
    const { setVideoEndStateTimerVisible } = props
    setVideoEndStateTimerVisible(false)
  }, [])

  //
  // onLogin event listener
  // renders the login modal
  const onLogin = useCallback((e) => {
    e.preventDefault()
    const { setOverlayDialogVisible } = props
    setOverlayDialogVisible(TYPE_LOGIN)
  }, [])

  //
  // onShare event listener
  // renders the share modal
  const onShare = useCallback(() => {
    const {
      setVideoEndStateTimerVisible,
      renderModal,
      clearShare,
    } = props
    setVideoEndStateTimerVisible(false)
    renderModal(TYPE_SHARE_V2_SHARE, {
      contentId: video.getIn(['data', 'id']),
      title: video.getIn(['data', 'title']),
      onDismiss: () => clearShare(),
      type: 'VIDEO',
    })
  }, [video])

  return (
    <div className="video-player-ended">
      <VideoPlayerBack
        className={CLASS_NAMES.VIDEO_PLAYER_BACK}
        location={location}
        history={history}
        visible
      />
      {type === TYPE_PREVIEW && !subscriptions.size ? (
        <VideoPlayerMeta
          title={video.getIn(['data', 'title'])}
          className={CLASS_NAMES.META}
          moreVisible={false}
          visible
        />
      ) : null}
      {type === TYPE_PREVIEW
        ? renderPreviewEndState(props, onLogin)
        : renderFeatureEndState(props, onShare)}
      <VideoCommentsToggle
        commentsCount={video.getIn(['data', 'commentTotalCount'], 0)}
        className={['video-player-ended__video-comments-toggle']}
        contextType={CONTEXT_TYPE_VIDEO_END_STATE}
        onCommentsWillShow={onCommentsWillShow}
        refreshComments={refreshComments}
        comments={comments}
        video={video}
        auth={auth}
        visible
      />
      {auth.get('jwt') && props.type !== TYPE_PREVIEW ? (
        <div className="video-player-ended__up-next">
          <VideoPlayerUpNext
            setVideoPlayerEnded={props.setVideoPlayerEnded}
            previousVideoType={previousVideoType}
            getTilesData={props.getTilesData}
            deleteTiles={props.deleteTiles}
            enableTimer={enableTimer}
            location={props.location}
            history={props.history}
            tiles={props.tiles}
            auth={props.auth}
            id={videoId}
          />
        </div>
      ) : null}
    </div>
  )
}

VideoPlayerEnded.propTypes = {
  setVideoPlayerEnded: PropTypes.func.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  getTilesData: PropTypes.func.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  deleteTiles: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
}

export default connect(
  state => ({
    staticText: state.staticText.getIn(['data', 'videoPlayerEnded']),
    isShareable: state.media.getIn(['data', 'isShareable'], false),
    userAccount: state.userAccount,
    comments: state.comments,
    user: state.user,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setVideoEndStateTimerVisible: actions.video.setVideoEndStateTimerVisible,
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      refreshComments: actions.comments.refreshComments,
      renderModal: actions.dialog.renderModal,
      clearShare: actions.share.clearShare,
    }
  },
)(VideoPlayerEnded)
