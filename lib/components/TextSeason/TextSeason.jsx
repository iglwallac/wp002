import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'

function getClassName (inputClassName) {
  return ['text-season'].concat(inputClassName || []).join(' ')
}

function TextSeason (props) {
  const { className, number, staticText } = props
  return (
    <span className={getClassName(className)}>
      {`${staticText.get('s')}${number}`}
    </span>
  )
}

TextSeason.propTypes = {
  number: PropTypes.number.isRequired,
  className: PropTypes.array,
  lang: PropTypes.string,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'textSeason', 'data']),
}))(TextSeason)
