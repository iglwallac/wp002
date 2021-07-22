import PropTypes from 'prop-types'
import { Component } from 'react'
import { triggerEvent } from 'services/optimizely'

class OptimizelyEvent extends Component {
  componentDidMount () {
    const { eventName } = this.props
    triggerEvent(eventName)
  }

  render () {
    return null
  }
}

OptimizelyEvent.propTypes = {
  eventName: PropTypes.string.isRequired,
}

export default OptimizelyEvent
