import React from 'react'
import { connect as connectRedux } from 'react-redux'
import { INTERSTITIAL_SELECT_PROFILE, INTERSTITIAL_LOADING } from 'services/interstitial'
import WhoIsWatching from 'components/Interstitial/WhoIsWatching'
import Loading from 'components/Interstitial/Loading'

function getContent (view) {
  switch (view) {
    case INTERSTITIAL_SELECT_PROFILE:
      return <WhoIsWatching />
    case INTERSTITIAL_LOADING:
      return <Loading />
    default:
      return null
  }
}

function Interstitial ({ view }) {
  return (
    <div className="interstitial" role="dialog">
      <div className="interstitial__gradient" role="presentation" />
      <div className="interstitial__content">
        {getContent(view)}
      </div>
    </div>
  )
}

export default connectRedux(
  ({ interstitial }) => ({
    view: interstitial.get('view'),
  }),
)(Interstitial)
