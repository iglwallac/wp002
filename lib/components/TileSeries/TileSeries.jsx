import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { connect as connectRouter } from 'components/Router/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import { List, Map } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link from 'components/Link'
import TileHero from 'components/TileHero'
import Vote, { SIZE_SMALL as VOTE_SIZE_SMALL } from 'components/Vote'
import _isFunction from 'lodash/isFunction'
import { getBoundActions } from 'actions'
import { upstreamContextOnClick } from 'services/upstream-context'

class TileSeries extends PureComponent {
  //
  onClickSeriesTitle = (evt) => {
    const { props } = this
    const {
      app,
      auth,
      id,
      location,
      page,
      setEventSeriesVisited,
      upstreamContext,
      setUpstreamContext,
    } = props
    if (_isFunction(setEventSeriesVisited)) {
      setEventSeriesVisited({ auth, location, page, id, app })
    }
    upstreamContextOnClick(evt, { upstreamContext, setUpstreamContext })
  }

  isSubscribed = () => {
    const { props } = this
    const { notifications, id } = props
    const userSubscriptions = notifications.getIn(['data', 'userSubscriptions'], List())
    const subscription = userSubscriptions.find(sub => sub.get('contentId') === id, null, Map())
    return !!subscription.get('subscriber')
  }

  renderLabel = (value) => {
    const { props } = this
    const { staticText } = props
    const isSubscribed = this.isSubscribed()

    if (isSubscribed) {
      return <div className="tile-series__label">{staticText.getIn(['data', 'following'])}</div>
    }

    if (value) {
      return <div className="tile-series__label">{value}</div>
    }

    return null
  }

  renderSeriesFlag = (staticText) => {
    return (
      <div className="tile-series__series-flag">
        {staticText.getIn(['data', 'series'])}
      </div>
    )
  }

  renderTitle = (props) => {
    const { onClickSeriesTitle } = this
    if (props.title) {
      return (
        <Link
          to={props.url}
          className="tile-video__title"
          data-element="series-title"
          onClick={onClickSeriesTitle}
        >
          {props.title}
        </Link>
      )
    }

    return null
  }

  renderBottomMeta = (props) => {
    const { episodeCount, staticText } = props
    const episodesText =
      episodeCount > 1
        ? staticText.getIn(['data', 'episodes'])
        : staticText.getIn(['data', 'episode'])
    const bottomMetaItemClass = 'tile-series__meta-item'

    if (episodeCount) {
      return (
        <span className={bottomMetaItemClass}>
          {`${episodeCount} ${episodesText}`}
        </span>
      )
    }

    return null
  }

  render () {
    const {
      props,
      renderLabel,
      renderSeriesFlag,
      renderTitle,
      renderBottomMeta,
    } = this
    const {
      auth,
      feature,
      preview,
      image,
      url,
      showMoreInfo,
      toolTipComponent,
      onClickWatch,
      onClickMoreInfo,
      label,
      vote,
      voteDown,
      voteId,
      active,
      staticText,
      upstreamContext,
      displayMoreInfoButton,
      vertical = false,
      type,
    } = props
    const itemClass = Array.isArray(props.seriesTileClass)
      ? props.seriesTileClass.join(' ')
      : props.seriesTileClass
    return (
      <div className={itemClass ? `tile-series ${itemClass}` : 'tile-series'}>
        {renderLabel(label)}
        <TileHero
          displayMoreInfoButton={displayMoreInfoButton}
          image={image}
          type={type}
          url={url}
          hasPlayIcon={false}
          auth={auth}
          preview={preview}
          feature={feature}
          showMoreInfo={showMoreInfo}
          toolTipComponent={toolTipComponent}
          active={active}
          onClickMoreInfo={onClickMoreInfo}
          onClickWatch={onClickWatch}
          upstreamContext={upstreamContext}
          vertical={vertical}
        />
        <div className="tile-series__top-meta">
          <Vote
            auth={auth}
            vote={vote}
            voteDown={voteDown}
            voteId={voteId}
            size={VOTE_SIZE_SMALL}
            className="vote--right-align vote--small"
          />
          {renderSeriesFlag(staticText)}
        </div>
        {renderTitle(props)}
        <div className="tile-series__bottom-meta">{renderBottomMeta(props)}</div>
      </div>
    )
  }
}

TileSeries.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  active: PropTypes.bool,
  id: PropTypes.number,
  seriesTileClass: PropTypes.array,
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  label: PropTypes.string,
  seasonCount: PropTypes.number,
  episodeCount: PropTypes.number,
  vote: PropTypes.number,
  voteId: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  host: PropTypes.string,
  onClickMoreInfo: PropTypes.func,
  showMoreInfo: PropTypes.bool.isRequired,
  toolTipComponent: PropTypes.element,
  preview: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  onClickWatch: PropTypes.func,
  setEventSeriesVisited: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
}

TileSeries.defaultProps = {
  vote: 0,
}

export default compose(
  connectRouter(),
  connect(
    state => ({
      app: state.app,
      notifications: state.notifications,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
      }
    },
  ),
  connectStaticText({ storeKey: 'tileSeries' }),
  pure,
)(TileSeries)
