import React from 'react'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Button from 'components/Button'
import LivePageTimer from 'components/EventsPage/LivePageTimer'
import ImmutablePropTypes from 'react-immutable-proptypes'

export const Countdown = ({ countDown, staticText }) => (
  <div>
    {staticText.getIn(['data', 'countdownLabel'])} <LivePageTimer startDate={new Date().getTime() + countDown} />
  </div>
)

export const StreamingNow = ({ staticText }) => (
  <div className="spotlight-live-access__streaming-now">
    <span className="dot" /> {staticText.getIn(['data', 'streamingNow'])}
  </div>
)

export const Status = ({ countDown, staticText }) => {
  return (
    <div className="spotlight-live-access-status">
      {countDown ?
        <Countdown countDown={countDown} staticText={staticText} />
        :
        <StreamingNow staticText={staticText} />
      }
    </div>
  )
}

const SpotlightLiveAccess = ({ data, staticText }) => {
  const countdown = data && data.get('countdown')
  return data ? (
    <div
      className="spotlight-live-access"
      style={{
        backgroundImage: `url(${data.getIn(['mobileBackgroundUrl'])})`,
      }}
    >
      <div className="spotlight-live-access__content">
        <Status countDown={countdown} staticText={staticText} />
        <div className="spotlight-live-access__title">
          {data.getIn(['title'])}
        </div>
        <div className="spotlight-live-access__subTitle">
          {data.getIn(['subTitle'])}
        </div>
        <div className="spotlight-live-access__description">
          {data.getIn(['description'])}
        </div>
        <Button
          text={countdown ? staticText.getIn(['data', 'moreInfo']) : staticText.getIn(['data', 'watchNow'])}
          url="/live"
          buttonClass="button button--primary"
        />
      </div>
    </div>
  ) : null
}

SpotlightLiveAccess.propTypes = {
  data: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'spotlightLiveAccess' }),
)(SpotlightLiveAccess)
