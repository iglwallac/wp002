import PropTypes from 'prop-types'
import React from 'react'
import { getBoundActions } from 'actions'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import TileSubscription from 'components/TileSubscription'
import { Map } from 'immutable'
import { CUSTOM_ROW_CLICK_EVENT } from 'services/event-tracking'

const TileHoverPerson = (props) => {
  const { name, path, image, adminTitle, setDefaultGaEvent, isPeopleRow } = props
  const handleTileClick = () => {
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Click Tile')
      .set('eventLabel', adminTitle)
      .set('contentInfo', name)
      .set('impressionClicks', 1)
    setDefaultGaEvent(eventData)
  }
  return (
    <TileSubscription
      title={name}
      hero={image}
      url={path}
      onClick={isPeopleRow && handleTileClick}
    />
  )
}

TileHoverPerson.propTypes = {
  id: PropTypes.number.isRequired,
}

export default compose(
  connect(
    (state, props) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const data = state.term.getIn([props.id, language, 'data'], Map())
      return {
        name: data.get('name'),
        path: data.get('path'),
        image: data.getIn(['termImages', 'headshot', 'headshot_233x233']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(TileHoverPerson)
