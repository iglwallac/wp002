import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import isFunction from 'lodash/isFunction'
import { connect as connectRedux } from 'react-redux'

function PushHistory ({
  pushHistory,
  condition,
  timeout,
  query,
  url,
}) {
  useEffect(() => {
    const push = !!(isFunction(condition)
      ? condition() : condition)
    if (push) {
      pushHistory({
        timeout,
        query,
        url,
      })
    }
  }, condition)
  return null
}

PushHistory.defaultProps = {
  condition: true,
}

PushHistory.propTypes = {
  url: PropTypes.string.isRequired,
  timeout: PropTypes.number,
  condition: PropTypes.any,
  query: PropTypes.object,
}

export default connectRedux(null, () => {
  const { navigation } = getBoundActions()
  return { pushHistory: navigation.pushHistory }
})(PushHistory)
