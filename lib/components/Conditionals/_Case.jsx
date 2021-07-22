import PropTypes from 'prop-types'

export default function Case () {
  throw new Error('Cannot render Case outside of Switch.')
}

Case.defaultProps = {
  condition: false,
}

Case.propTypes = {
  children: PropTypes.func.isRequired,
  condition: PropTypes.any,
}
