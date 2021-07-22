import isFunction from 'lodash/isFunction'
import PropTypes from 'prop-types'

export default function If ({ condition, children }) {
  const isTrue = !!(isFunction(condition)
    ? condition() : condition)
  return isTrue ? children() : null
}

If.defaultProps = {
  condition: false,
}

If.propTypes = {
  children: PropTypes.func.isRequired,
  condition: PropTypes.any,
}
