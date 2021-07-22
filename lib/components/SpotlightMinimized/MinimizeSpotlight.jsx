import React, { useCallback } from 'react'
import { fromJS } from 'immutable'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { Button } from 'components/Button.v2'
import IconV2, { ICON_TYPES, ICON_STYLES } from 'components/Icon.v2'
import { getBoundActions } from 'actions'
import { MH_SPOTLIGHT_COLLAPSED_KEY } from 'services/feature-tracking'
import { SPOTLIGHT_TOGGLE_EVENT } from 'services/event-tracking'

const MinimizeSpotlight = (props) => {
  const { setDefaultGaEvent } = props
  const onMinimize = useCallback(() => {
    props.setFeatureTrackingDataPersistent({
      data: fromJS({ [MH_SPOTLIGHT_COLLAPSED_KEY]: true }),
    })
    const eventData = SPOTLIGHT_TOGGLE_EVENT
      .set('eventLabel', 'off')
    setDefaultGaEvent(eventData)
  })
  return (
    <div
      className="minimize-spotlight"
    >
      <Button
        className="minimize-spotlight__button"
        onClick={onMinimize}
      >
        <IconV2 style={ICON_STYLES.OUTLINE} type={ICON_TYPES.COLLAPSE} className="minimize-spotlight__icon" />
      </Button>
    </div >
  )
}

export default compose(
  connectRedux(
    null,
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
        setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
      }
    },
  ),
)(MinimizeSpotlight)
