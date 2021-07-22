import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import DetailEpisode from 'components/DetailEpisode'
import DetailVideo from 'components/DetailVideo'
import DetailPlaceholder from 'components/DetailPlaceholder'
import { getBoundActions } from 'actions'
import { List } from 'immutable'
import { STORE_KEY_DETAIL } from 'services/store-keys'
import { connect as connectRedux } from 'react-redux'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { connect as connectPage } from 'components/Page/connect'
import { connect as connectLanguage } from 'components/Language/connect'
import DetailSeries from 'components/DetailSeries'
import { EN } from 'services/languages/constants'
import { getPrimary } from 'services/languages'

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
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
} from 'services/content-type'

function createOnLanguageChange (actions) {
  return actions.detail.resetDetailData
}

function detailIsSynced (detail, resolver) {
  const resolvedId = resolver.getIn(['data', 'id'])
  return (
    resolvedId === detail.get('id') &&
    resolvedId === detail.getIn(['data', 'id'])
  )
}

function updateData (props) {
  // We are only interested when if entity data has been updated
  const { auth, resolver, detail, location, inboundTracking, user } = props
  const {
    getDetailData,
    setDetailDataPlaceholder,
    setInboundTrackingContentImpression,
  } = props
  const resolvedId = resolver.getIn(['data', 'id'])
  const detailId = detail.getIn(['data', 'id'])
  const resolverSynced = resolverIsSynced(resolver, location)
  const detailSynced = detailIsSynced(detail, resolver)

  // We are only interested when if entity data has been updated
  if (
    !detail.get('placeholderExists') &&
    location.pathname !== detail.get('path')
  ) {
    setDetailDataPlaceholder(false)
    return
  }

  if (
    resolvedId > 0 &&
    resolverSynced &&
    !detailSynced &&
    !detail.get('processing')
  ) {
    getDetailData({
      id: resolvedId,
      path: location.pathname,
      type: resolver.getIn(['data', 'type']),
      language: user.getIn(['data', 'language'], List()),
    })
  }

  if (detailIsSynced && !resolver.get('processing') && detailId) {
    const recordedId = inboundTracking.getIn(['data', 'ci_id'])
    const contentType = detail.getIn(['data', 'impressionType'])
    const uid = auth.get('uid')

    if (recordedId !== detailId) {
      setInboundTrackingContentImpression({
        uid,
        ci_id: detailId,
        ci_type: contentType,
      })
    }
  }
}

class DetailPage extends PureComponent {
  componentDidMount () {
    updateData(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }

    updateData(nextProps)
  }

  componentWillUnmount () {
    const { detail, deleteDetailDataUserInfo } = this.props
    if (detail.getIn(['data', 'userInfo'])) {
      deleteDetailDataUserInfo()
    }
  }

  render () {
    const { props } = this
    const { history, location, detail } = props
    const type = detail.getIn(['data', 'type', 'content'])

    switch (type) {
      case TYPE_CONTENT_VIDEO:
      case TYPE_CONTENT_VIDEO_YOGA:
      case TYPE_CONTENT_VIDEO_FITNESS:
      case TYPE_CONTENT_VIDEO_MEDITATION:
        return (
          <div className="detail">
            <DetailVideo location={location} history={history} />
          </div>
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
          <div className="detail">
            <DetailEpisode history={history} location={location} />
          </div>
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
          <div className="detail">
            <DetailSeries history={history} location={location} />
          </div>
        )
      default:
        return (
          <div className="detail">
            <DetailPlaceholder />
          </div>
        )
    }
  }
}

DetailPage.propTypes = {
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  getDetailData: PropTypes.func.isRequired,
  setDetailDataPlaceholder: PropTypes.func.isRequired,
  setInboundTrackingContentImpression: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  deleteDetailDataUserInfo: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      resolver: state.resolver,
      detail: state.detail,
      shelf: state.shelf,
      auth: state.auth,
      inboundTracking: state.inboundTracking,
      user: state.user,
      tiles: state.tiles,
      testarossa: state.testarossa,
      isEnglish: getPrimary(state.user.getIn(['data', 'language'])) === EN,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        actions,
        getDetailData: actions.detail.getDetailData,
        setDetailDataPlaceholder: actions.detail.setDetailDataPlaceholder,
        setInboundTrackingContentImpression:
          actions.inboundTracking.setInboundTrackingContentImpression,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        deleteDetailDataUserInfo: actions.detail.deleteDetailDataUserInfo,
      }
    },
  ),
  connectLanguage({ createOnLanguageChange }),
  connectPage({
    storeKey: STORE_KEY_DETAIL,
    storeBranch: 'jumbotron',
  }),
)(DetailPage)
