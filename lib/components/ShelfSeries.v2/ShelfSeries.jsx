import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import Tile from 'components/Tile'
import Vote from 'components/Vote'
import Button from 'components/Button'
import Icon from 'components/Icon'
import Link from 'components/Link'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import { connect } from 'react-redux'
import _partial from 'lodash/partial'
import { truncate } from 'theme/web-app'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Watch, { WATCH_RENDER_TYPE_OVERLAY_LINK } from 'components/Watch'
import {
  updateUpstreamContext,
  CONTEXT_TYPE_SHELF_FEATURED_EPISODE,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import { isEntitled, featureIsFree } from 'services/subscription'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WithAuth from 'components/WithAuth'
import { getBoundActions } from 'actions'
import { CUSTOM_ROW_CLICK_EVENT, HIDDEN_CONTENT_HIDE_EVENT } from 'services/event-tracking'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { updateFeaturedEpisode } from './utils'

function getLabel (staticText, type) {
  switch (type) {
    case 'new':
      return staticText.getIn(['data', 'watchNewEpisode'])
    case 'next':
      return staticText.getIn(['data', 'watchNextEpisode'])
    case 'first':
      return staticText.getIn(['data', 'watchFirstEpisode'])
    case 'latest':
      return staticText.getIn(['data', 'watchLatestEpisode'])
    case 'last':
      return staticText.getIn(['data', 'watchLastEpisode'])
    default:
      return staticText.getIn(['data', 'watchNow'])
  }
}

function getFeaturedTitle (data) {
  const season = data.get('season')
  const episode = data.get('episode')
  const title = data.get('title')
  return `S${season}:Ep${episode}- ${title}`
}

function renderPrimaryAction (props) {
  const { auth, staticText, featuredEpisode, upstreamContext, onClickWatch } = props
  const data = featuredEpisode.getIn(['data', 'titles', 0])
  if (data && data.has('feature')) {
    const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
    const featureOfferingIsFree = featureIsFree(
      data.getIn(['feature', 'offerings', 'availability']),
    )

    if (!userIsEntitled && !featureOfferingIsFree) {
      return (
        <ButtonSignUp
          text={staticText.getIn(['data', 'signUpToWatch'])}
          buttonClass={['button--primary', 'button--stacked']}
          type={BUTTON_SIGN_UP_TYPE_BUTTON}
          scrollToTop
        />
      )
    }

    return (
      <Watch
        url={data.get('url')}
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
          <div className="shelf-episode-v2__me-1232-watch-wrapper">
            <div className="shelf-episode-v2__me-1232-watch-text">
              {getLabel(staticText, data.get('featuredTileType'))}
            </div>
          </div>
          <div className="shelf-episode-v2__me-1232-watch-title">
            {getFeaturedTitle(data)}
          </div>
        </div>
      </Watch>
    )
  }
  return null
}

class ShelfSeries extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showMoreActions: false,
    }
  }

  componentDidMount () {
    const props = this.props
    updateFeaturedEpisode(props)
  }

  componentWillReceiveProps (nextProps) {
    const props = this.props
    const shelfId = props.shelf.getIn(['data', 'id'])
    const nextShelfId = nextProps.shelf.getIn(['data', 'id'])

    if (nextShelfId !== shelfId) {
      updateFeaturedEpisode(nextProps)
    }
  }

  onClickWatch = () => {
    const { setDefaultGaEvent, shelf, upstreamContext } = this.props
    const data = shelf.get('data')
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Play Click')
      .set('eventLabel', upstreamContext.get(CONTEXT_NAME_ADMIN_TITLE))
      .set('contentInfo', `${data.get('seriesTitle')} | series | ${data.get('id')}`)
    setDefaultGaEvent(eventData)
  }

  // eslint-disable-next-line class-methods-use-this
  renderTotalSeasonsEpisodes (totalSeasons, totalEpisodes, staticText) {
    if (totalSeasons && totalEpisodes) {
      return (
        <div className="shelf-series-v2__meta-item">
          {`${totalSeasons} ${staticText.getIn([
            'data',
            'seasons',
          ])}, ${totalEpisodes} ${staticText.getIn(['data', 'episodes'])} `}
        </div>
      )
    }

    if (totalSeasons && !totalEpisodes) {
      return (
        <div className="shelf-series-v2__meta-item">
          {`${totalSeasons} ${staticText.getIn(['data', 'seasons'])}`}
        </div>
      )
    }

    if (totalEpisodes && !totalSeasons) {
      return (
        <div className="shelf-series-v2__meta-item">
          {`${totalEpisodes} ${staticText.getIn(['data', 'episodes'])}`}
        </div>
      )
    }
    return null
  }

  // eslint-disable-next-line class-methods-use-this
  renderHost (host, staticText) {
    if (host) {
      return (
        <div className="shelf-episode-v2__meta-item">
          {`${staticText.getIn(['data', 'host'])}: ${host}`}
        </div>
      )
    }
    return null
  }

  // eslint-disable-next-line class-methods-use-this
  renderFeaturedEpisode (data, auth, upstreamContext) {
    if (data) {
      return (
        <div className="shelf-series-v2__featured-episode shelf-series-v2__featured-episode--white">
          <Tile
            tileClass="shelf-series-v2__featured-episode-tile"
            tileData={data}
            showMoreInfo={false}
            single
            auth={auth}
            upstreamContext={updateUpstreamContext(
              upstreamContext,
              'contextType',
              CONTEXT_TYPE_SHELF_FEATURED_EPISODE,
            )}
          />
        </div>
      )
    }
    return null
  }

  render () {
    const props = this.props
    const {
      staticText,
      shelfSeriesClass,
      auth,
      id,
      getComments,
      clearUpstreamContext,
      shelf,
      showHideContentButton,
      hideContent,
    } = props
    const itemClass = Array.isArray(shelfSeriesClass)
      ? shelfSeriesClass.join(' ')
      : shelfSeriesClass
    const data = shelf.get('data')
    const getCommentsPartial = _partial(
      getComments,
      id,
      auth.get('jwt'),
    )

    const showMoreOptions = () => {
      this.setState({ showMoreActions: !this.state.showMoreActions })
    }

    const handleCommentsClick = () => {
      getCommentsPartial()
      clearUpstreamContext()
    }
    const onClickHide = (e) => {
      const { setDefaultGaEvent, onClickClose } = props
      const eventData = HIDDEN_CONTENT_HIDE_EVENT
        .set('eventLabel', data.get('title'))
      setDefaultGaEvent(eventData)
      onClickClose(e)
      hideContent({ contentType: 'series', contentId: id })
    }
    const featuredEpisodeData = props.featuredEpisode.getIn(
      ['data', 'titles', 0],
      null,
    )

    return (
      <div className={itemClass ? `shelf-series-v2 ${itemClass}` : 'shelf-series-v2'}>
        <div className="shelf-series-v2__meta">
          <Link className="shelf-series-v2__title" to={data.get('path')}>
            {data.get('title')}
          </Link>
          <div className="shelf-series-v2__meta-items">
            {this.renderTotalSeasonsEpisodes(
              data.get('totalSeasons'),
              data.get('totalEpisodes'),
              staticText,
            )}
            {this.renderHost(data.get('host'), staticText)}
          </div>
          <div className="shelf-series-v2__meta-items-placeholder" />
          <p className="shelf-series-v2__description">
            {truncate(data.get('description'), 400)}
          </p>
          <div className="shelf-series-v2__stats">
            <div className="shelf-series-v2__stat-item">
              <Vote
                vote={data.get('vote')}
                voteDown={data.get('voteDown')}
                voteId={props.shelf.get('id')}
                auth={props.auth}
              />
            </div>
            <div
              onClick={handleCommentsClick}
              className="shelf-series-v2__stat-item shelf-series-v2__stat-item--comment-count"
            >
              <Icon iconClass={['icon--comment', 'icon--small']} />
              <span className="shelf-series-v2__stat-count">
                {data.get('commentTotalCount')}
              </span>
              <span className="shelf-series-v2__stat-text">
                {staticText.getIn(['data', 'comments'])}
              </span>
            </div>
          </div>
          {renderPrimaryAction({ ...props, onClickWatch: this.onClickWatch })}
          <span className="shelf-series-v2__actions-add-icon">
            <span className={`shelf-series-v2__actions-more-icon${this.state.showMoreActions ? ' shelf-series-v2__actions--hidden' : ''}`}>
              <Icon onClick={() => showMoreOptions()} iconClass={['icon-v2 icon-v2--ellipsis']} />
              <span className="shelf-series-v2__actions-more-icon-text" onClick={() => showMoreOptions()}>{staticText.getIn(['data', 'moreActions'])}</span>
            </span>
          </span>
        </div>
        {this.renderFeaturedEpisode(featuredEpisodeData, props.auth, props.upstreamContext)}
        <div className={`shelf-series-v2__actions-more shelf-series-v2__actions${this.state.showMoreActions ? '' : ' shelf-series-v2__actions--hidden'}`}>
          <div className="shelf-series-v2__actions-top">
            <div className="shelf-series-v2__actions-top-text">{staticText.getIn(['data', 'moreActions'])}</div>
            <span className="shelf-series-v2__actions-top-close"><Icon onClick={() => showMoreOptions()} iconClass={['icon-v2 icon-v2--close']} /></span>
          </div>
          <WithAuth>
            <NotificationsFollowButton
              subscriptionType={SUBSCRIPTION_TYPES.SERIES}
              contentId={data.get('id')}
              type={BUTTON_TYPES.LINK}
            />
          </WithAuth>
          <TestarossaSwitch>
            <TestarossaCase campaign="ME-3043" variation={[1]}>
              {() => (
                showHideContentButton ? <Button
                  text={staticText.getIn(['data', 'removeSeries'])}
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
        </div>
      </div>
    )
  }
}

ShelfSeries.propTypes = {
  shelfSeriesClass: PropTypes.array,
  shelf: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  featuredEpisode: ImmutablePropTypes.map.isRequired,
  getComments: PropTypes.func.isRequired,
  getTilesData: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
}

const connectedComponentStaticText = connectStaticText({ storeKey: 'shelfSeriesV2' })(
  ShelfSeries,
)
const connectedComponent = connect(
  state => ({ user: state.user }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      hideContent: actions.hiddenContentPreferences.hideContent,
    }
  })(connectedComponentStaticText)

export default connectedComponent
