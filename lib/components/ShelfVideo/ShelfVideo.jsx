import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import { formatDuration, truncate } from 'theme/web-app'
import { partial as _partial } from 'lodash'
import Vote from 'components/Vote'
import Button from 'components/Button'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import Icon from 'components/Icon'
import WithAuth from 'components/WithAuth'
import Link from 'components/Link'
import Watch, { WATCH_RENDER_TYPE_BUTTON } from 'components/Watch'
import { CONTEXT_NAME_ADMIN_TITLE } from 'services/upstream-context'
import { isEntitled, featureIsFree } from 'services/subscription'
import { TYPE_CONTENT_VIDEO } from 'services/content-type'
import { getBoundActions } from 'actions'
import { TYPE_SHARE_V2_SHARE } from 'services/dialog'
import { CUSTOM_ROW_CLICK_EVENT } from 'services/event-tracking'

function closeShareDialog (props) {
  const { clearShare } = props
  clearShare()
}

function renderWatch (props) {
  const {
    auth,
    shelf,
    staticText,
    upstreamContext,
    onClickWatch,
  } = props
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
      upstreamContext={upstreamContext}
      renderType={WATCH_RENDER_TYPE_BUTTON}
      buttonClass={['button--primary', 'button--stacked']}
      onClickWatch={onClickWatch}
    />
  )
}

function renderPreview (props) {
  const { shelf, staticText } = props
  const data = shelf.get('data')
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
        'shelf-video__action-button',
        'shelf-video__action-button--desktop-only',
      ]}
    />
  )
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

function ShelfVideo (props) {
  const {
    staticText,
    video,
    upstreamContext,
    auth,
    isShareable,
    clearUpstreamContext,
  } = props
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const itemClass = Array.isArray(props.shelfVideoClass)
    ? props.shelfVideoClass.join(' ')
    : props.shelfVideoClass

  // Get legacy data
  const data = props.shelf.get('data')

  // Get data
  const getCommentsPartial = _partial(
    props.getComments,
    props.id,
    props.auth.get('jwt'),
  )
  const handleCommentsClick = () => {
    getCommentsPartial()
    clearUpstreamContext()
  }
  const type = data.getIn(['type', 'content'])
  const contentId = video.get('id')

  const onClickWatch = () => {
    const { setDefaultGaEvent } = props
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Play Click')
      .set('eventLabel', upstreamContext.get(CONTEXT_NAME_ADMIN_TITLE))
      .set('contentInfo', `${video.get('title')} | video | ${contentId}`)
    setDefaultGaEvent(eventData)
  }

  return (
    <div className={itemClass ? `shelf-video ${itemClass}` : 'shelf-video'}>
      <div className="shelf-video__meta">
        <Link className="shelf-video__title" to={data.get('path')}>
          {data.get('title')}
        </Link>
        {data.get('instructor') && (
          <div className="shelf-video__instructor">
            {
              data.get('yogaTeacherPath') || data.get('fitnessInstructorPath') ?
                <Link to={data.get('yogaTeacherPath') || data.get('fitnessInstructorPath')}>
                  {data.get('instructor')}
                </Link> : data.get('instructor')
            }
          </div>
        )}
        <div className="shelf-video__meta-items">
          {type === TYPE_CONTENT_VIDEO && data.get('year') ? (
            <span className="shelf-video__meta-item">{data.get('year')}</span>
          ) : null}
          {data.get('meditationStyle') && (
            <span className="shelf-video__meta-item">{'Meditation'}</span>
          )}
          {data.get('duration') && (
            <span className="shelf-video__meta-item">
              {formatDuration(data.get('duration'))}
            </span>
          )}
          {data.get('guest') && (
            <div className="shelf-video__meta-item">{`${staticText.get(
              'featuring',
            )}: ${data.get('guest')}`}</div>
          )}
          {data.get('yogaStyle') && (
            <span className="shelf-video__meta-item">
              { getMetaItem(data.get('yogaStyle'), data.get('yogaStylePath')) }
            </span>
          )}
          {data.get('yogaLevel') && (
            <span className="shelf-video__meta-item">
              { getMetaItem(data.get('yogaLevel'), data.get('yogaLevelPath')) }
            </span>
          )}
          {data.get('yogaDuration') && (
            <span className="shelf-video__meta-item">
              { getMetaItem(formatDuration(data.get('yogaDuration')), data.get('yogaDurationPath')) }
            </span>
          )}
          {data.get('fitnessStyle') && (
            <span className="shelf-video__meta-item">
              { getMetaItem(data.get('fitnessStyle'), data.get('fitnessStylePath')) }
            </span>
          )}
          {data.get('fitnessLevel') && (
            <span className="shelf-video__meta-item">
              { getMetaItem(data.get('fitnessLevel'), data.get('fitnessLevelPath')) }
            </span>
          )}
          {data.get('fitnessDuration') && (
            <span className="shelf-video__meta-item">
              { getMetaItem(formatDuration(data.get('fitnessDuration')), data.get('fitnessDurationPath')) }
            </span>
          )}
        </div>
        <div className="shelf-video__meta-items-placeholder" />
        <p className="shelf-video__description">
          {truncate(data.get('description'), 400)}
        </p>
        <div className="shelf-video__stats">
          <div className="shelf-video__stat-item">
            <Vote
              vote={data.get('vote')}
              voteDown={data.get('voteDown')}
              voteId={parseInt(props.shelf.get('id'), 10)}
              auth={props.auth}
            />
          </div>
          <div
            onClick={handleCommentsClick}
            className="shelf-video__stat-item shelf-video__stat-item--comment-count"
          >
            <Icon iconClass={['icon--comment', 'icon--small']} />
            <span className="shelf-video__stat-count">
              {data.get('commentTotalCount')}
            </span>
            <span className="shelf-video__stat-text">
              {staticText.get('comments')}
            </span>
          </div>
        </div>
        {props.playlistAddRemoveComponent}
      </div>
      <div className="shelf-video__actions">
        { renderWatch({ ...props, onClickWatch }) }
        {isShareable && userIsEntitled ?
          <WithAuth>
            <Button
              text={staticText.get('share')}
              buttonClass={[
                'button--ghost',
                'button--with-icon',
                'button--stacked',
                'shelf-video__action-button',
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
          text={staticText.get('moreDetails')}
          url={data.get('path')}
          buttonClass={[
            'button--ghost',
            'button--with-icon',
            'button--stacked',
            'shelf-episode__action-button',
            'shelf-episode__action-button--desktop-only',
          ]}
          iconClass={['icon--dots']}
          scrollToTop
        />
      </div>
    </div>
  )
}

ShelfVideo.propTypes = {
  shelfVideoClass: PropTypes.array,
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
      staticText: state.staticText.getIn(['data', 'shelfVideo', 'data']),
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
)(ShelfVideo)
