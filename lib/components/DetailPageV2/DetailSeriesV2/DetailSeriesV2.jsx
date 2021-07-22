import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { compose } from 'recompose'
import { TYPE_CONTENT_SERIES } from 'services/content-type'
import DetailJumbotron from 'components/DetailPageV2/DetailJumbotron'
import DetailSeriesSeasons from 'components/DetailPageV2/DetailSeriesSeasons'
import { connect as connectTiles } from 'components/Tiles/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { STORE_KEY_DETAIL_FEATURED_EPISODE } from 'services/store-keys'
import { TYPE_FEATURED_EPISODE } from 'services/tiles'
import FloatingActionToolbar from 'components/DetailPageV2/FloatingActionToolbar'
import DetailMetadata from 'components/DetailPageV2/DetailMetadata'

function DetailSeriesV2 (props) {
  const { location, history, staticText } = props

  return (
    <article className="detail-series-V2">
      <DetailJumbotron
        type={TYPE_CONTENT_SERIES}
        titleSeparator={staticText.getIn(['data', 'with'])}
      />
      <div className="detail-series-V2__content">
        <FloatingActionToolbar type={TYPE_CONTENT_SERIES} />
        <DetailMetadata type={TYPE_CONTENT_SERIES} />
        <DetailSeriesSeasons location={location} history={history} />
      </div>
    </article>
  )
}

DetailSeriesV2.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

export default compose(
  connectTiles({
    storeKey: STORE_KEY_DETAIL_FEATURED_EPISODE,
    type: TYPE_FEATURED_EPISODE,
    attachProps: false,
    enablePageBehaviors: true,
  }),
  connectStaticText({ storeKey: 'detailSeriesV2' }),
)(DetailSeriesV2)
