import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'

function getClassName (inputClassName) {
  return ['text-episode'].concat(inputClassName || []).join(' ')
}

class TextEpisode extends PureComponent {
  render () {
    const { className, number, staticText } = this.props
    return (
      <span className={getClassName(className)}>
        {`${staticText.get('ep')}${number}`}
      </span>
    )
  }
}

TextEpisode.propTypes = {
  number: PropTypes.number.isRequired,
  className: PropTypes.array,
  lang: PropTypes.string,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'textEpisode', 'data']),
}))(TextEpisode)
