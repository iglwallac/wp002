import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Tile from 'components/Tile'
import _partial from 'lodash/partial'
import {
  historyRedirect,
  HISTORY_METHOD_REPLACE,
} from 'services/navigation'
import { connect } from 'react-redux'
import { Map, List } from 'immutable'
import { TYPE_NEXT_VIDEO } from 'services/tiles'
import { STORE_KEY_VIDEO_PLAYER_NEXT } from 'services/store-keys'
import { createWatchUrl } from 'components/Watch'
import { getBoundActions } from 'actions'
import {
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
} from 'services/content-type'
import {
  createUpstreamContext,
  SCREEN_TYPE_VIDEO_PLAYER,
  CONTEXT_TYPE_VIDEO_END_STATE,
} from 'services/upstream-context'
import ButtonToggle from 'components/ButtonToggle'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { ENDSTATE_AUTOPLAY_TOGGLED } from 'services/event-tracking'

function shouldAutoPlay (props) {
  const previousVideoType = props.previousVideoType
  // Set the timer except for yoga, fitness and meditation
  switch (previousVideoType) {
    case TYPE_CONTENT_VIDEO_YOGA:
    case TYPE_CONTENT_VIDEO_FITNESS:
    case TYPE_CONTENT_VIDEO_MEDITATION:
    case TYPE_CONTENT_EPISODE_YOGA:
    case TYPE_CONTENT_EPISODE_FITNESS:
    case TYPE_CONTENT_EPISODE_MEDITATION:
    case TYPE_CONTENT_SEGMENT_YOGA:
    case TYPE_CONTENT_SEGMENT_FITNESS:
    case TYPE_CONTENT_SEGMENT_MEDITATION:
      return false
    default:
      return true
  }
}

function getTilesState (storeKey, props) {
  return props.tiles.get(storeKey, Map())
}

function renderTile (props, tileData) {
  if (!tileData) {
    return null
  }
  return (
    <Tile
      auth={props.auth}
      tileData={tileData}
      tileClass="video-player-up-next__tile"
      showMoreInfo={false}
      single
      onClickWatch={_partial(onClickWatch, _partial.placeholder, props)}
    />
  )
}

function onAutoPlaySettingsChange (props) {
  const { disableAutoPlayNext, setFeatureTrackingDataPersistent } = props
  setFeatureTrackingDataPersistent({
    data: Map({ disableAutoPlayNext: !disableAutoPlayNext }),
  })
}

function renderTimerText (tileData, state, props) {
  const { staticText, disableAutoPlayNext, staticTextOn, staticTextOff } = props
  if (!tileData) {
    return null
  }

  const eventData = ENDSTATE_AUTOPLAY_TOGGLED
    .set('eventLabel', !disableAutoPlayNext ? 'off' : 'on')

  const labelAutoplay = staticText.getIn(['data', 'autoplay'])
  const labelOn = `${labelAutoplay} ${staticTextOn}`
  const labelOff = `${labelAutoplay} ${staticTextOff}`

  if (shouldAutoPlay(props)) {
    return (
      <div className="video-player-up-next__timer">
        {props.enableTimer && (
          <div className="video-player-up-next__timer-text-autoplay">
            {/* ME-3043 experiment - disable end state autoplay */}
            { disableAutoPlayNext ?
              <span className="video-player-up-next__timer-text">
                {staticText.getIn(['data', 'recommended_next'])}
              </span>
              :
              <span className="video-player-up-next__timer-text--large">
                {`${staticText.getIn(['data', 'upNext'])} ${staticText.getIn(['data', 'in'])} ${state.seconds} ${staticText.getIn(['data', 'sec'])}`}
              </span>
            }
            <TestarossaSwitch>
              <TestarossaCase campaign="ME-3043" variation={1}>
                {(campaign, variation, subject) => (
                  <span>
                    <ButtonToggle
                      onChange={() => onAutoPlaySettingsChange(props)}
                      checked={!disableAutoPlayNext}
                      campaign={campaign}
                      subject={subject}
                      variation={variation}
                      gaEventData={eventData}
                      showLabel
                      labelTextOn={labelOn}
                      labelTextOff={labelOff}
                      round
                      small
                    />
                  </span>
                )}
              </TestarossaCase>
              <TestarossaDefault unwrap>
                {() => (
                  null
                )}
              </TestarossaDefault>
            </TestarossaSwitch>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="video-player-up-next__timer video-player-up-next__timer-text-autoplay">
      <span className="video-player-up-next__timer-text">
        {staticText.getIn(['data', 'recommended_next'])}
      </span>
    </div>
  )
}

function onClickWatch (e, props) {
  gotoNextVideo(props)
}

function fireNextVideoEvent (options) {
  const { props, timer, nextVideoId } = options
  const {
    id,
    setUpstreamContext,
  } = props

  const upstreamContext = createUpstreamContext({
    screenType: SCREEN_TYPE_VIDEO_PLAYER,
    contextType: CONTEXT_TYPE_VIDEO_END_STATE,
    nextVideoId,
    videoId: id,
    autoplay: !!timer,
  })

  setUpstreamContext(upstreamContext)
}

function gotoNextVideo (props, timer) {
  const { location, history, auth, language } = props
  const { pathname } = location
  const tilesState = getTilesState(STORE_KEY_VIDEO_PLAYER_NEXT, props)
  const tileData = tilesState.getIn(['data', 'titles', 0], Map())
  const url = tileData.get('url')
  const nextVideoId = tileData.get('id')
  // If you can watch, go the next video, otherwise go to the next video detail page
  // if there is no next video url, go back to the just watched video detai page
  fireNextVideoEvent({ props, timer, nextVideoId })
  if (!url) {
    historyRedirect({ history, url: pathname, auth, language })
    return
  }
  const watchUrl = createWatchUrl(
    auth,
    tileData.get('feature', Map()),
    tileData.get('preview', Map()),
    url,
  )
  historyRedirect({
    history,
    url: watchUrl,
    auth,
    language,
    historyMethod: HISTORY_METHOD_REPLACE,
  })
}

class VideoPlayerUpNext extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      seconds: 15,
    }
  }

  componentDidMount () {
    const { props } = this
    const { auth, id, location, getTilesData, user = Map() } = props

    if (process.env.BROWSER) {
      const tilesState = getTilesState(STORE_KEY_VIDEO_PLAYER_NEXT, props)
      const language = (user.getIn(['data', 'language'], List()) || List()
      ).toJS()

      if (!tilesState.get('processing') && !tilesState.get('data')) {
        getTilesData(
          STORE_KEY_VIDEO_PLAYER_NEXT,
          id,
          Map({ type: TYPE_NEXT_VIDEO, language }),
          0,
          1,
          null,
          location,
          auth.get('uid'),
          auth.get('jwt'),
        )
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER) {
      const tilesState = getTilesState(STORE_KEY_VIDEO_PLAYER_NEXT, nextProps)
      if (
        !this._setUpNextInterval &&
        !tilesState.get('processing') &&
        tilesState.get('data')
      ) {
        if (shouldAutoPlay(nextProps)) {
          this.setTimer()
        }
      }
      if (!nextProps.enableTimer) {
        clearInterval(this._setUpNextInterval)
      }
    }
    return undefined
  }

  componentWillUnmount () {
    if (this._setUpNextInterval) {
      clearInterval(this._setUpNextInterval)
    }
    this.props.deleteTiles(STORE_KEY_VIDEO_PLAYER_NEXT)
    this.props.setVideoPlayerEnded(false)
  }

  setTimer = () => {
    this._setUpNextInterval = setInterval(this.listener, 1000)
  }

  listener = () => {
    const { disableAutoPlayNext } = this.props
    this.setState(({ seconds }) => {
      if (seconds > 0) {
        return { seconds: seconds - 1 }
      }
      clearInterval(this._setUpNextInterval)
      if (!disableAutoPlayNext) {
        gotoNextVideo(this.props, 'timer')
      }
      return {}
    })
  }

  render () {
    const props = this.props
    const state = this.state
    const tilesState = getTilesState(STORE_KEY_VIDEO_PLAYER_NEXT, props)
    if (!tilesState) {
      return null
    }
    const tileData = tilesState.getIn(['data', 'titles', 0], null)
    return (
      <div className="video-player-up-next">
        {renderTimerText(tileData, state, props)}
        {renderTile(props, tileData)}
      </div>
    )
  }
}

VideoPlayerUpNext.propTypes = {
  auth: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  getTilesData: PropTypes.func.isRequired,
  deleteTiles: PropTypes.func.isRequired,
  setVideoPlayerEnded: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
  enableTimer: PropTypes.bool.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  clearUpstreamContext: PropTypes.func.isRequired,
  setEventDataVideoPlayed: PropTypes.func.isRequired,
}

export default connect(
  state => ({
    staticText: state.staticText.getIn(['data', 'videoPlayerUpNext']),
    staticTextOn: state.staticText.getIn(['data', 'buttonToggle', 'data', 'labelOn']),
    staticTextOff: state.staticText.getIn(['data', 'buttonToggle', 'data', 'labelOff']),
    user: state.user,
    language: state.user.getIn(['data', 'language']),
    app: state.app,
    page: state.page,
    video: state.video,
    disableAutoPlayNext: state.featureTracking.getIn(['data', 'disableAutoPlayNext'], false),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setEventDataVideoPlayed: actions.eventTracking.setEventDataVideoPlayed,
      clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
      setUpstreamContext: actions.upstreamContext.setUpstreamContext,
      setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
    }
  },
)(VideoPlayerUpNext)
