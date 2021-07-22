import React from 'react'
import { ALL_YOGA_PRACTICES_ID } from 'services/placement-content'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import YogaMultipackTile from 'components/YogaMultipackTile'
import YogaMultipackCarousel from 'components/YogaMultipackCarousel'
import { List } from 'immutable'
import _get from 'lodash/get'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_VIDEO,
} from 'services/content-type'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'

class YogaMultipack extends React.Component {
  componentDidMount () {
    const { props } = this
    const {
      auth,
      getPlacementContentData,
      language,
    } = props
    getPlacementContentData({ auth, tid: ALL_YOGA_PRACTICES_ID, language: language.first() })
  }

  componentDidUpdate (prevProps) {
    const {
      auth,
      getPlacementContentData,
      language,
      placementContent,
    } = this.props
    const prevContent = _get(prevProps, 'placementContent')
    const prevTitles = prevContent.getIn(['data', 'titles'])
    const titles = placementContent.getIn(['data', 'titles'])

    if (_get(prevProps, 'language') !== language) {
      getPlacementContentData({
        auth,
        tid: ALL_YOGA_PRACTICES_ID,
        language: language.first(),
      })
    }
    // make sure we only fire tracking events once
    if (prevTitles !== titles && titles.hasIn([0, 'userInfo'])) {
      this.trackImpressions()
    }
  }

  trackImpressions = () => {
    const { props } = this
    const {
      placementContent,
      setEventVideoImpressed,
      setEventSeriesImpressed,
      auth,
      location,
      page,
      app,
      language,
      upstreamContext,
    } = props

    const titles = placementContent.getIn(['data', 'titles'])

    if (titles) {
      titles.map((title, itemIndex) => {
        const nid = title.get('nid')
        const campaignId = title.getIn(['merchandising', 'campaignId'])
        if (title.get('type').includes(TYPE_CONTENT_SERIES)) {
          const updatedContext = upstreamContext.merge({
            seriesId: nid,
            itemIndex,
            campaignId,
          })
          return setEventSeriesImpressed({
            auth,
            location,
            page,
            app,
            upstreamContext: updatedContext,
            language,
          })
        } else if (title.get('type').includes(TYPE_CONTENT_VIDEO)) {
          const updatedContext = upstreamContext.merge({
            videoId: nid,
            itemIndex,
            campaignId,
          })
          return setEventVideoImpressed({
            auth,
            location,
            page,
            app,
            upstreamContext: updatedContext,
            language,
          })
        } return null
      })
    }
  }

  renderTiles = () => {
    const { props } = this
    const {
      placementContent,
      auth,
      setInPlaylist,
      upstreamContext,
      setUpstreamContext,
    } = props
    const backgroundStyle = placementContent.getIn(['data', 'titles', 0, 'hero_image_notext', 'hero_1440x400'])

    return (
      <div className="yoga-3-pack__tiles">
        <div className="yoga-3-pack__background">
          <img className="yoga-3-pack__background--image" src={backgroundStyle} alt="test" />
        </div>
        <div className="yoga-3-pack__mask" />
        <div className="yoga-3-pack__tiles-container">
          <div className="yoga-3-pack__tile-container yoga-3-pack__tile-container--left">
            <YogaMultipackTile
              tile={placementContent.getIn(['data', 'titles', 1])}
              placement="left"
              auth={auth}
              setInPlaylist={setInPlaylist}
              upstreamContext={upstreamContext}
              setUpstreamContext={setUpstreamContext}
              itemIndex={1}
            />
          </div>
          <div className="yoga-3-pack__tile-container yoga-3-pack__tile-container--center">
            <YogaMultipackTile
              tile={placementContent.getIn(['data', 'titles', 0])}
              placement="center"
              auth={auth}
              setInPlaylist={setInPlaylist}
              upstreamContext={upstreamContext}
              setUpstreamContext={setUpstreamContext}
              itemIndex={0}
            />
          </div>
          <div className="yoga-3-pack__tile-container yoga-3-pack__tile-container--right">
            <YogaMultipackTile
              tile={placementContent.getIn(['data', 'titles', 2])}
              placement="right"
              auth={auth}
              setInPlaylist={setInPlaylist}
              upstreamContext={upstreamContext}
              setUpstreamContext={setUpstreamContext}
              itemIndex={2}
            />
          </div>
        </div>
      </div>
    )
  }

  render () {
    const {
      props,
      renderTiles,
    } = this
    const {
      placementContent,
    } = props

    if (placementContent.getIn(['data', 'titles'])) {
      return (
        <div className="yoga-3-pack">
          <YogaMultipackCarousel {...this.props} />
          { renderTiles() }
        </div>
      )
    } else if (placementContent.get('processing')) {
      return (
        <Sherpa type={TYPE_LARGE} className={['yoga-3-pack__sherpa']} />
      )
    }
    return null
  }
}

YogaMultipack.propTypes = {
  upstreamContext: ImmutablePropTypes.map,
  auth: ImmutablePropTypes.map.isRequired,
  placementContent: ImmutablePropTypes.map,
  getPlacementContentData: PropTypes.func.isRequired,
  setInPlaylist: PropTypes.func.isRequired,
  setEventVideoImpressed: PropTypes.func.isRequired,
  setEventSeriesImpressed: PropTypes.func.isRequired,
  userLanguage: PropTypes.string,
  location: PropTypes.object,
}

export default compose(
  connectRedux(
    state => ({
      placementContent: state.placementContent,
      page: state.page,
      language: state.user.getIn(['data', 'language'], List()),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getPlacementContentData: actions.placementContent.getPlacementContentData,
        setInPlaylist: actions.playlist.setInPlaylist,
        setEventVideoImpressed: actions.eventTracking.setEventVideoImpressed,
        setEventSeriesImpressed: actions.eventTracking.setEventSeriesImpressed,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
      }
    },
  ),
)(YogaMultipack)
