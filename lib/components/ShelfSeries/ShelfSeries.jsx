import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Tile from 'components/Tile'
import Vote from 'components/Vote'
import Button from 'components/Button'
import Icon from 'components/Icon'
import Link from 'components/Link'
import { connect } from 'react-redux'
import _partial from 'lodash/partial'
import { truncate } from 'theme/web-app'
import { connect as connectStaticText } from 'components/StaticText/connect'
import {
  updateUpstreamContext,
  CONTEXT_TYPE_SHELF_FEATURED_EPISODE,
  CONTEXT_NAME_ADMIN_TITLE,
} from 'services/upstream-context'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import WithAuth from 'components/WithAuth'
import { getBoundActions } from 'actions'
import { CUSTOM_ROW_CLICK_EVENT } from 'services/event-tracking'
import { updateFeaturedEpisode } from './utils'

class ShelfSeries extends PureComponent {
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
        <div className="shelf-series__meta-item">
          {`${totalSeasons} ${staticText.getIn([
            'data',
            'seasons',
          ])}, ${totalEpisodes} ${staticText.getIn(['data', 'episodes'])} `}
        </div>
      )
    }

    if (totalSeasons && !totalEpisodes) {
      return (
        <div className="shelf-series__meta-item">
          {`${totalSeasons} ${staticText.getIn(['data', 'seasons'])}`}
        </div>
      )
    }

    if (totalEpisodes && !totalSeasons) {
      return (
        <div className="shelf-series__meta-item">
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
        <div className="shelf-episode__meta-item">
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
        <div className="shelf-series__featured-episode shelf-series__featured-episode--white">
          <Tile
            tileClass="shelf-series__featured-episode-tile"
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

    const handleCommentsClick = () => {
      getCommentsPartial()
      clearUpstreamContext()
    }
    const featuredEpisodeData = props.featuredEpisode.getIn(
      ['data', 'titles', 0],
      null,
    )

    return (
      <div className={itemClass ? `shelf-series ${itemClass}` : 'shelf-series'}>
        <div className="shelf-series__meta">
          <Link className="shelf-series__title" to={data.get('path')}>
            {data.get('title')}
          </Link>
          <div className="shelf-series__meta-items">
            {this.renderTotalSeasonsEpisodes(
              data.get('totalSeasons'),
              data.get('totalEpisodes'),
              staticText,
            )}
            {this.renderHost(data.get('host'), staticText)}
          </div>
          <div className="shelf-series__meta-items-placeholder" />
          <p className="shelf-series__description">
            {truncate(data.get('description'), 400)}
          </p>
          <div className="shelf-series__stats">
            <div className="shelf-series__stat-item">
              <Vote
                vote={data.get('vote')}
                voteDown={data.get('voteDown')}
                voteId={props.shelf.get('id')}
                auth={props.auth}
              />
            </div>
            <div
              onClick={handleCommentsClick}
              className="shelf-series__stat-item shelf-series__stat-item--comment-count"
            >
              <Icon iconClass={['icon--comment', 'icon--small']} />
              <span className="shelf-series__stat-count">
                {data.get('commentTotalCount')}
              </span>
              <span className="shelf-series__stat-text">
                {staticText.getIn(['data', 'comments'])}
              </span>
            </div>
          </div>
        </div>
        {this.renderFeaturedEpisode(featuredEpisodeData, props.auth, props.upstreamContext)}
        <div className="shelf-series__actions">
          <WithAuth>
            <NotificationsFollowButton
              subscriptionType={SUBSCRIPTION_TYPES.SERIES}
              contentId={data.get('id')}
              type={BUTTON_TYPES.LINK}
            />
          </WithAuth>
          <Button
            text={staticText.getIn(['data', 'fullSeries'])}
            url={data.get('path')}
            buttonClass={[
              'button--ghost',
              'button--with-icon',
              'button--stacked',
              'shelf-series__action-button',
            ]}
            iconClass={['icon--episodes']}
            scrollToTop
          />
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

const connectedComponentStaticText = connectStaticText({ storeKey: 'shelfSeries' })(
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
