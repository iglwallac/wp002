import PropTypes from 'prop-types'
import React from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import DetailEpisodeV2 from 'components/DetailPageV2/DetailEpisodeV2'
import DetailVideoV2 from 'components/DetailPageV2/DetailVideoV2'
import DetailSeriesV2 from 'components/DetailPageV2/DetailSeriesV2'
import DetailPlaceholder from 'components/DetailPlaceholder'
import _get from 'lodash/get'
import { connect as connectRedux } from 'react-redux'
import {
  isTypeVideoAll,
  isTypeEpisodeAll,
  isTypeSeriesAll,
} from 'services/content-type'

function DetailPageV2 (props) {
  const { history, location, detail, jumbotron, resolver } = props

  function jumbotronIsSynced () {
    const resolvedId = resolver.getIn(['data', 'id'])
    return (
      resolvedId === jumbotron.getIn(['detail', 'id']) &&
      resolvedId === jumbotron.getIn(['detail', 'data', 'id'])
    )
  }

  function detailIsSynced () {
    const resolvedId = resolver.getIn(['data', 'id'])
    return (
      resolvedId === detail.get('id') &&
      resolvedId === detail.getIn(['data', 'id'])
    )
  }

  const getDetail = () => {
    const type = detail.getIn(['data', 'type', 'content'])
    const typeVideo = isTypeVideoAll(type)
    const typeEpisode = isTypeEpisodeAll(type)
    const typeSeries = isTypeSeriesAll(type)
    const detailSynced = _get(location, ['pathname']) === detail.get('path') &&
      _get(location, ['pathname']) === jumbotron.getIn(['detail', 'path']) &&
      jumbotronIsSynced() &&
      detailIsSynced()

    if (detailSynced && typeVideo) {
      return (
        <DetailVideoV2 location={location} history={history} />
      )
    } else if (detailSynced && typeEpisode) {
      return (
        <DetailEpisodeV2 history={history} location={location} />
      )
    } else if (detailSynced && typeSeries) {
      return (
        <DetailSeriesV2 history={history} location={location} />
      )
    }

    return (
      <DetailPlaceholder />
    )
  }

  return (
    <div className="detailV2">
      {getDetail()}
    </div>
  )
}

DetailPageV2.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  jumbotron: ImmutablePropTypes.map.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      detail: state.detail,
      jumbotron: state.jumbotron,
      resolver: state.resolver,
    }),
  ),
)(DetailPageV2)
