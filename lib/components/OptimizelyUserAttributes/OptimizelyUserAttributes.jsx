import { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { addUserAttributes } from 'services/optimizely'

class OptimizelyUserAttributes extends Component {
  componentDidMount () {
    const { attributes } = this.props
    addUserAttributes(attributes.toJS())
  }

  componentWillReceiveProps (nextProps) {
    const { attributes } = this.props
    const { nextAttributes } = nextProps
    if (!attributes.equals(nextAttributes)) {
      addUserAttributes(attributes.toJS())
    }
  }

  render () {
    return null
  }
}

OptimizelyUserAttributes.propTypes = {
  attributes: ImmutablePropTypes.map.isRequired,
}

export default OptimizelyUserAttributes
