import PropTypes from 'prop-types'

export default function Default () {
  throw new Error('Cannot render Default outside of Switch.')
}

Default.propTypes = {
  children: PropTypes.func.isRequired,
}
