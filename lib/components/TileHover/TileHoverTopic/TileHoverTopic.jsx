import PropTypes from 'prop-types'
import React from 'react'
import { getBoundActions } from 'actions'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Map } from 'immutable'
import { CUSTOM_ROW_CLICK_EVENT } from 'services/event-tracking'
import Link from 'components/Link'

const TileHoverTopic = (props) => {
  const { name, path, image, adminTitle } = props
  const eventData = CUSTOM_ROW_CLICK_EVENT
    .set('eventAction', 'Click Tile')
    .set('eventLabel', adminTitle)
    .set('contentInfo', name)
    .set('impressionClicks', 1)
  return (
    <div className="tile-hover-topic">
      <Link className="tile-hover-topic__link" to={path} eventData={eventData}>
        <div className="tile-hover-topic__wrapper">
          <img src={image} alt={name} className="tile-hover-topic__image" />
        </div>
        <div className="tile-hover-topic__name">
          {name}
        </div>
      </Link>
    </div>
  )
}

TileHoverTopic.propTypes = {
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
        image: data.getIn(['termImages', 'tile', 'tile_374x156']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(TileHoverTopic)
