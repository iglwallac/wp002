import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import { partial as _partial } from 'lodash'
import {
  TYPE_PLACEHOLDER,
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SERIES_LINK,
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
} from 'services/content-type'
import { RESOLVER_TYPE_NODE } from 'services/resolver/types'
import {
  TYPE_TAB_OVERVIEW,
  TYPE_TAB_EPISODES,
  TYPE_TAB_RELATED,
} from 'services/shelf'
import {
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_EPISODES_NEXT,
} from 'services/store-keys'
import { TYPE_RELATED, TYPE_NEXT_EPISODE } from 'services/tiles'

function getTabClassName (props, type) {
  const className = ['shelf__tab']
  const activeTab = props.activeTab || TYPE_TAB_OVERVIEW
  if (activeTab === type) {
    className.push('shelf__tab--active')
  }
  return className.join(' ')
}

function onClickEpisode (e, props) {
  e.stopPropagation()

  const {
    auth,
    user = Map(),
    location,
    shelf,
    tiles,
    seriesId,
    setShelfActiveTab,
    getTilesData,
    getTilesSeriesData,
  } = props

  const contentType = shelf.get('type')
  const language = user.getIn(['data', 'language'], List())

  // TODO: tilesId is only looking at the STORE_KEY_SHELF_EPISODES branch,
  // which made sense when we were only using that. Temporarily, we also have
  // the STORE_KEY_SHELF_EPISODES_NEXT branch
  const tilesId = tiles.getIn([STORE_KEY_SHELF_EPISODES, 'id'])
  const seasonNums = shelf.getIn(['data', 'seasonNums'], List()).toJS()
  const productionStatus = shelf.getIn(['data', 'productionStatus'], '')

  setShelfActiveTab(TYPE_TAB_EPISODES)

  // @TODO Change to support more than 8 tiles.
  if (tilesId !== seriesId) {
    switch (contentType) {
      case TYPE_CONTENT_EPISODE:
      case TYPE_CONTENT_EPISODE_YOGA:
      case TYPE_CONTENT_EPISODE_FITNESS:
      case TYPE_CONTENT_EPISODE_MEDITATION:
      case TYPE_CONTENT_SEGMENT:
      case TYPE_CONTENT_SEGMENT_YOGA:
      case TYPE_CONTENT_SEGMENT_FITNESS:
      case TYPE_CONTENT_SEGMENT_MEDITATION:
        return getTilesData(
          STORE_KEY_SHELF_EPISODES_NEXT,
          shelf.get('id'),
          Map({ type: TYPE_NEXT_EPISODE, language }),
          0,
          4,
          null,
          location,
          auth.get('uid'),
          auth.get('jwt'),
          seriesId,
        )
      case TYPE_CONTENT_SERIES:
      case TYPE_CONTENT_SERIES_YOGA:
      case TYPE_CONTENT_SERIES_FITNESS:
      case TYPE_CONTENT_SERIES_MEDITATION:
      case TYPE_CONTENT_SERIES_LINK:
      case TYPE_CONTENT_SEGMENTED:
      case TYPE_CONTENT_SEGMENTED_YOGA:
      case TYPE_CONTENT_SEGMENTED_FITNESS:
      case TYPE_CONTENT_SEGMENTED_MEDITATION:
        return getTilesSeriesData(
          STORE_KEY_SHELF_EPISODES,
          seriesId,
          Map({ type: RESOLVER_TYPE_NODE, language }),
          0,
          100,
          null,
          location,
          auth.get('uid'),
          auth.get('jwt'),
          seriesId,
          seasonNums,
          productionStatus,
        )
      default:
        return getTilesData(
          STORE_KEY_SHELF_EPISODES,
          seriesId,
          Map({ type: RESOLVER_TYPE_NODE, resetSeasonData: true, language }),
          0,
          100,
          null,
          location,
          auth.get('uid'),
          auth.get('jwt'),
        )
    }
  }
  return null
}

function renderEpisodeTab (props) {
  const { staticText, showEpisodeTab } = props

  if (!showEpisodeTab) {
    return null
  }
  return (
    <span
      className={getTabClassName(props, TYPE_TAB_EPISODES)}
      onClick={_partial(onClickEpisode, _partial.placeholder, props)}
    >
      {staticText.get('episodes')}
    </span>
  )
}

function onClickRelated (e, props) {
  e.stopPropagation()

  const { user = Map, tiles } = props
  const tilesId = tiles.getIn([STORE_KEY_SHELF_RELATED, 'id'])
  const language = user.getIn(['data', 'language'], List())

  props.setShelfActiveTab(TYPE_TAB_RELATED)

  // @TODO Change to support more than 8 tiles.
  if (tilesId !== props.shelf.get('id')) {
    props.getTilesData(
      STORE_KEY_SHELF_RELATED,
      props.shelf.get('id'),
      Map({ type: TYPE_RELATED, language }),
      0,
      8,
      null,
      props.location,
      props.auth.get('uid'),
      props.auth.get('jwt'),
    )
  }
}

function renderRelatedTab (props) {
  const { staticText, showRelatedTab } = props
  if (showRelatedTab === false) {
    return null
  }
  return (
    <span
      className={getTabClassName(props, TYPE_TAB_RELATED)}
      onClick={_partial(onClickRelated, _partial.placeholder, props)}
    >
      {staticText.get('related')}
    </span>
  )
}

function ShelfTabs (props) {
  const { contentType, staticText, setShelfActiveTab } = props
  // If placeholder, type not yet set...don't display the tabs.
  if (contentType === TYPE_PLACEHOLDER) {
    return null
  }
  return (
    <div className="shelf__tabs">
      <span
        className={getTabClassName(props, TYPE_TAB_OVERVIEW)}
        onClick={function onClickOverview (e) {
          e.stopPropagation()
          setShelfActiveTab(TYPE_TAB_OVERVIEW)
        }}
      >
        {staticText.get('overview')}
      </span>
      {renderEpisodeTab(props)}
      {renderRelatedTab(props)}
    </div>
  )
}

ShelfTabs.propTypes = {
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  contentType: PropTypes.string.isRequired,
  showRelatedTab: PropTypes.bool,
  showEpisodeTab: PropTypes.bool.isRequired,
  seriesId: PropTypes.number,
  getTilesData: PropTypes.func.isRequired,
  activeTab: PropTypes.string,
  setShelfActiveTab: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  getTilesSeriesData: PropTypes.func.isRequired,
  getTilesEpisodeData: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

const connectShelfTabs = connect(state => ({
  staticText: state.staticText.getIn(['data', 'shelfTabs', 'data']),
  user: state.user,
}))(ShelfTabs)

export default connectShelfTabs
