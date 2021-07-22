import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fromJS, Map, List } from 'immutable'
import TileVideo from 'components/TileVideo'
import TileEpisode from 'components/TileEpisode'
import TileSeries from 'components/TileSeries'
import TileSubcategory from 'components/TileSubcategory'
import TileSeriesLink from 'components/TileSeriesLink'
import TilePlaceholder from 'components/TilePlaceholder'
import LabelFree from 'components/LabelFree'
import { hasLiveAccessEntitlement, isEntitled } from 'services/subscription'
import { ACCESS_PREVIEW, ACCESS_FEATURE } from 'components/WatchAccess'

import {
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SERIES_LINK,
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
  TYPE_CONTENT_UNKNOWN,
  TYPE_CONTENT_SUBCATEGORY,
} from 'services/content-type'
import { isLiveAccessFeature } from 'components/LiveAccessFloatingActionToolbar'

function getClassName (
  active,
  showMoreInfo,
  inRow,
  single,
  tileClass,
  playlistEditComponent,
  hideWatchedEditComponent,
  useShelfV2,
) {
  const className = ['tile']
  if (active && showMoreInfo) {
    className.push('tile--active')
    if (useShelfV2) {
      className.push('tile--active-shelfV2')
    }
  }
  if (inRow) {
    className.push('tile--row')
  } else if (single) {
    className.push('tile--single')
  } else {
    className.push('tile--gallery')
  }
  if (playlistEditComponent || hideWatchedEditComponent) {
    className.push('tile--edit-mode')
  }
  className.push(tileClass)
  return className.join(' ')
}

function getContentClassName (active, type) {
  return ['tile__content']
    .concat(
      active && type !== TYPE_CONTENT_SERIES_LINK
        ? 'tile__content--active'
        : [],
    )
    .join(' ')
}

// eslint-disable-next-line max-len
function getLabel (staticText, type, isNew, featuredType, featuredLabel, hasNewEpisodes, options = {}) {
  const { isLiveAccessUpgradeToWatch } = options
  if (featuredType === 'merchandising-campaign') {
    return featuredLabel
  }

  switch (type) {
    case TYPE_CONTENT_VIDEO:
      return isNew ? staticText.get('newVideo') : null

    case TYPE_CONTENT_EPISODE:
      if (isLiveAccessUpgradeToWatch) {
        return staticText.get('upgradeToWatch')
      }
      switch (featuredType) {
        case 'new':
          return staticText.get('newEpisode')
        case 'next':
          return staticText.get('nextEpisode')
        case 'first':
          return staticText.get('firstEpisode')
        case 'latest':
          return staticText.get('latestEpisode')
        case 'last':
          return staticText.get('lastEpisode')
        case 'continue':
          return staticText.get('continueWatching')
        default:
          return isNew ? staticText.get('newEpisode') : null
      }

    case TYPE_CONTENT_SERIES:
      if (hasNewEpisodes) {
        return staticText.get('newEpisode')
      } else if (isNew) {
        return staticText.get('new')
      }
      return null

    default:
      return null
  }
}

function renderFreeLabel (props) {
  const { tileData, auth, isFree } = props
  const contentType = tileData.getIn(['type', 'content'])
  const userSubscriptions = auth.get('subscriptions', List())
  const featureOfferingAvailibility = tileData.getIn(['feature', 'offerings', 'availability'])
  if (contentType === TYPE_CONTENT_SUBCATEGORY) {
    return null
  }
  return (
    <LabelFree
      featureOfferingAvailibility={featureOfferingAvailibility}
      userSubscriptions={userSubscriptions}
      contentType={contentType}
      isFree={isFree}
    />
  )
}

function renderContent (props, componentInstance) {
  const {
    tileData: data,
    staticText,
    setEventVideoVisited,
    setEventSeriesVisited,
    displayMoreInfoButton,
    addToPlaylist = false,
    showTeaser,
    onClickWatch,
    vertical = false,
    forceAccess,
    asShare,
    auth,
  } = props
  const { fullContext, handleOnClickMoreInfo } = componentInstance
  const type = data.getIn(['type', 'content'])
    ? data.getIn(['type', 'content'])
    : data.get('type', TYPE_CONTENT_UNKNOWN)

  const isInPlaylist = data.getIn(['userInfo', 'playlist'], false)

  const id = data.get('id')
  const subscriptions = auth.get('subscriptions', List())
  const isLiveAccessUpgradeToWatch = isLiveAccessFeature(data.get('feature', Map())) &&
        isEntitled(subscriptions) &&
        !hasLiveAccessEntitlement(subscriptions)
  switch (type) {
    case TYPE_CONTENT_VIDEO:
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
      return (
        <TileVideo
          asShare={asShare}
          onClickWatch={onClickWatch}
          displayMoreInfoButton={displayMoreInfoButton}
          auth={props.auth}
          page={props.page}
          active={props.active}
          onClickMoreInfo={handleOnClickMoreInfo}
          showMoreInfo={props.showMoreInfo}
          type={data.getIn(['type', 'content'])}
          heroLabel={props.heroLabel}
          title={data.get('title')}
          image={data.get('image')}
          vote={data.get('vote')}
          voteDown={data.get('voteDown')}
          forceAccess={forceAccess}
          voteId={id}
          id={id}
          label={getLabel(
            staticText,
            TYPE_CONTENT_VIDEO,
            data.get('isNew'),
            data.get('featuredTileType'),
            data.get('featuredTileLabel'),
          )}
          teaser={showTeaser ? data.get('teaser') : null}
          duration={data.get('duration')}
          userInfo={data.get('userInfo')}
          url={data.get('url', '')}
          host={data.get('host')}
          yogaStyle={data.get('yogaStyle')}
          yogaLevel={data.get('yogaLevel')}
          yogaLevelPath={data.get('yogaLevelPath')}
          yogaStylePath={data.get('yogaStylePath')}
          yogaDurationPath={data.get('yogaDurationPath')}
          yogaTeacherPath={data.get('yogaTeacherPath')}
          fitnessStyle={data.get('fitnessStyle')}
          fitnessLevel={data.get('fitnessLevel')}
          fitnessLevelPath={data.get('fitnessLevelPath')}
          fitnessStylePath={data.get('fitnessStylePath')}
          fitnessDurationPath={data.get('fitnessDurationPath')}
          fitnessInstructorPath={data.get('fitnessInstructorPath')}
          meditationStyle={data.get('meditationStyle')}
          preview={data.get('preview', Map())}
          feature={data.get('feature', Map())}
          setEventVideoVisited={setEventVideoVisited}
          isInPlaylist={isInPlaylist}
          addToPlaylist={addToPlaylist}
          upstreamContext={fullContext}
        />
      )
    case TYPE_CONTENT_EPISODE:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return (
        <TileEpisode
          asShare={asShare}
          onClickWatch={onClickWatch}
          displayMoreInfoButton={displayMoreInfoButton}
          auth={props.auth}
          active={props.active}
          type={data.getIn(['type', 'content'])}
          id={id}
          page={props.page}
          heroLabel={props.heroLabel}
          title={data.get('title')}
          seriesTitle={data.get('seriesTitle')}
          seriesPath={data.get('seriesPath')}
          image={data.get('image')}
          episode={data.get('episode')}
          season={data.get('season')}
          vote={data.get('vote')}
          voteDown={data.get('voteDown')}
          voteId={id}
          forceAccess={forceAccess}
          label={getLabel(
            staticText,
            TYPE_CONTENT_EPISODE,
            data.get('isNew'),
            data.get('featuredTileType'),
            data.get('featuredTileLabel'),
            null,
            { isLiveAccessUpgradeToWatch },
          )}
          teaser={showTeaser ? data.get('teaser') : null}
          duration={data.get('duration')}
          userInfo={data.get('userInfo')}
          url={data.get('url', data.get('path', '/'))}
          host={data.get('host')}
          yogaStyle={data.get('yogaStyle')}
          yogaLevel={data.get('yogaLevel')}
          yogaLevelPath={data.get('yogaLevelPath')}
          yogaStylePath={data.get('yogaStylePath')}
          yogaDurationPath={data.get('yogaDurationPath')}
          yogaTeacherPath={data.get('yogaTeacherPath')}
          fitnessStyle={data.get('fitnessStyle')}
          fitnessLevel={data.get('fitnessLevel')}
          fitnessLevelPath={data.get('fitnessLevelPath')}
          fitnessStylePath={data.get('fitnessStylePath')}
          fitnessDurationPath={data.get('fitnessDurationPath')}
          fitnessInstructorPath={data.get('fitnessInstructorPath')}
          meditationStyle={data.get('meditationStyle')}
          onClickMoreInfo={handleOnClickMoreInfo}
          showMoreInfo={props.showMoreInfo}
          preview={data.get('preview', Map())}
          feature={data.get('feature', Map())}
          setEventSeriesVisited={setEventSeriesVisited}
          setEventVideoVisited={setEventVideoVisited}
          isInPlaylist={isInPlaylist}
          addToPlaylist={addToPlaylist}
          upstreamContext={fullContext}
          hasOverlay={isLiveAccessUpgradeToWatch}
        />
      )
    case TYPE_CONTENT_SERIES:
    case TYPE_CONTENT_SERIES_YOGA:
    case TYPE_CONTENT_SERIES_FITNESS:
    case TYPE_CONTENT_SERIES_MEDITATION:
    case TYPE_CONTENT_SEGMENTED:
    case TYPE_CONTENT_SEGMENTED_YOGA:
    case TYPE_CONTENT_SEGMENTED_FITNESS:
    case TYPE_CONTENT_SEGMENTED_MEDITATION:
      return (
        <TileSeries
          onClickWatch={onClickWatch}
          displayMoreInfoButton={displayMoreInfoButton}
          auth={props.auth}
          active={props.active}
          id={id}
          page={props.page}
          type={data.getIn(['type', 'content'])}
          title={data.get('title')}
          image={vertical ? data.get('verticalImage') : data.get('image')}
          vote={data.get('vote')}
          voteDown={data.get('voteDown')}
          voteId={id}
          episodeCount={data.get('episodeCount')}
          seasonCount={data.get('seasonCount')}
          label={getLabel(
            staticText,
            TYPE_CONTENT_SERIES,
            data.get('isNew'),
            data.get('featuredTileType'),
            data.get('featuredTileLabel'),
            data.get('hasNewEpisodes'),
          )}
          teaser={data.get('teaser')}
          url={data.get('url', '')}
          host={data.get('host')}
          onClickMoreInfo={handleOnClickMoreInfo}
          showMoreInfo={props.showMoreInfo}
          preview={data.get('preview', Map())}
          feature={data.get('feature', Map())}
          setEventSeriesVisited={setEventSeriesVisited}
          upstreamContext={fullContext}
          vertical={vertical}
        />
      )
    case TYPE_CONTENT_SERIES_LINK:
      return <TileSeriesLink url={data.get('path') || ''} />
    case TYPE_CONTENT_SUBCATEGORY:
      return (
        <TileSubcategory
          title={data.get('title')}
          image={data.get('image')}
          url={data.get('url')}
        />
      )
    default:
      return <TilePlaceholder />
  }
}

class Tile extends React.PureComponent {
  constructor (props) {
    super(props)

    this.fullContext = props.upstreamContext ? props.upstreamContext.mergeDeep(fromJS({
      source: props.tileData.getIn(['reason', 'source'], null),
      score: props.tileData.getIn(['reason', 'score'], null),
      videoTasteSegment: props.tileData.getIn(['reason', 'videoTasteSegment'], null),
      itemIndex: props.itemIndex,
      rowType: props.rowType,
      rowIndex: props.rowIndex,
      destId: props.destId,
      campaignId: props.campaignId,
      displayRowIndex: props.displayRowIndex,
    })) : null
  }

  handleOnClickMoreInfo = (e) => {
    const { fullContext, props } = this
    const {
      active,
      tileData,
      rowId,
      onClickMoreInfoFunc,
      onChangeTileActive,
      itemIndex,
    } = props


    onClickMoreInfoFunc(
      e,
      active,
      tileData,
      rowId,
      onChangeTileActive,
      tileData.get('onClickMoreInfo'),
      fullContext,
      itemIndex,
      tileData.get('id'),
      tileData.get('contentType'),
    )
  }

  render () {
    const { props } = this
    const {
      active,
      tileData,
      showMoreInfo,
      inRow,
      single,
      tileClass,
      playlistEditComponent,
      hideWatchedEditComponent,
      shelfComponent,
      useShelfV2,
    } = props

    /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
    return (
      <article
        className={getClassName(
          active,
          showMoreInfo,
          inRow,
          single,
          tileClass,
          playlistEditComponent,
          hideWatchedEditComponent,
          useShelfV2,
        )}
      >
        {hideWatchedEditComponent || playlistEditComponent}
        <div
          className={getContentClassName(
            active,
            tileData.getIn(['type', 'content']),
          )}
        >
          {renderContent(props, this)}
          {renderFreeLabel(props)}
        </div>
        {shelfComponent}
      </article>
    )
    /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
  }
}

Tile.propTypes = {
  forceAccess: PropTypes.oneOf([
    ACCESS_FEATURE,
    ACCESS_PREVIEW,
  ]),
  auth: ImmutablePropTypes.map.isRequired,
  active: PropTypes.bool,
  tileClass: PropTypes.string,
  tileData: ImmutablePropTypes.map.isRequired,
  addToPlaylist: PropTypes.bool,
  showMoreInfo: PropTypes.bool.isRequired,
  showTeaser: PropTypes.bool,
  shelfComponent: PropTypes.element,
  playlistEditComponent: PropTypes.element,
  hideWatchedEditComponent: PropTypes.element,
  onClickMoreInfoFunc: PropTypes.func,
  onClickWatch: PropTypes.func,
  heroLabel: PropTypes.string,
  inRow: PropTypes.bool,
  single: PropTypes.bool,
  isFree: PropTypes.bool,
  asShare: PropTypes.bool,
  setEventVideoVisited: PropTypes.func,
  setEventSeriesVisited: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
}

export default connect(state => ({
  user: state.user,
  staticText: state.staticText.getIn(['data', 'tile', 'data']),
}))(Tile)
