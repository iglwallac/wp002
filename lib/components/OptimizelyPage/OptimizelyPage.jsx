import PropTypes from 'prop-types'
import { Component } from 'react'
import { activatePage } from 'services/optimizely'

class OptimizelyPage extends Component {
  componentDidMount () {
    const { pageName } = this.props
    activatePage(pageName)
  }

  render () {
    return null
  }
}

OptimizelyPage.propTypes = {
  pageName: PropTypes.string.isRequired,
}

export default OptimizelyPage
